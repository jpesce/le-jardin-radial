import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { resolveColor } from "../data/colors.js";
import { useI18n } from "../i18n/I18nContext.jsx";

const SIZE = 600;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 260;
const INNER_RADIUS = 40;
const LABEL_OFFSET = 20;
const MONTH_SLICE = (2 * Math.PI) / 12;
const ANGLE_OFFSET = -Math.PI / 2; // January at top
const T_DURATION = 450;

// Desired screen-pixel sizes for non-scaling elements
const MONTH_LABEL_PX = 12;
const EMPTY_MSG_PX = 12;
const CELL_STROKE_PX = 1;
const LINE_STROKE_PX = 1.5;
const ICON_SIZE = 16;

const arcGen = d3.arc();

function arcTween(d) {
  const prev = this.__prev || {
    innerR: (d.innerR + d.outerR) / 2,
    outerR: (d.innerR + d.outerR) / 2,
    startAngle: d.startAngle,
    endAngle: d.endAngle,
  };
  const iInner = d3.interpolate(prev.innerR, d.innerR);
  const iOuter = d3.interpolate(prev.outerR, d.outerR);
  this.__prev = { ...d };
  return (t) =>
    arcGen({
      innerRadius: iInner(t),
      outerRadius: iOuter(t),
      startAngle: d.startAngle,
      endAngle: d.endAngle,
    });
}

function arcTweenExit(d) {
  const prev = this.__prev || d;
  const midR = (prev.innerR + prev.outerR) / 2;
  const iInner = d3.interpolate(prev.innerR, midR);
  const iOuter = d3.interpolate(prev.outerR, midR);
  return (t) =>
    arcGen({
      innerRadius: iInner(t),
      outerRadius: iOuter(t),
      startAngle: d.startAngle,
      endAngle: d.endAngle,
    });
}

const SEASON_ICONS = [
  { monthIdx: 2, key: "spring", paths: [
    "M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5",
    "M12 7.5V9", "M7.5 12H9", "M16.5 12H15", "M12 16.5V15",
    "m8 8 1.88 1.88", "M14.12 9.88 16 8",
    "m8 16 1.88-1.88", "M14.12 14.12 16 16",
  ], circle: { cx: 12, cy: 12, r: 3 } },
  { monthIdx: 5, key: "summer", paths: [
    "M12 .5v2", "M12 21.5v2", "m3.87 3.87 1.41 1.41",
    "m18.72 18.72 1.41 1.41", "M.5 12h2", "M21.5 12h2",
    "m5.28 18.72-1.41 1.41", "m20.13 3.87-1.41 1.41",
  ], circle: { cx: 12, cy: 12, r: 5.5 } },
  { monthIdx: 8, key: "autumn", paths: [
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
    "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  ], rotate: 90 },
  { monthIdx: 11, key: "winter", paths: [
    "m10 20-1.25-2.5L6 18", "M10 4 8.75 6.5 6 6",
    "m14 20 1.25-2.5L18 18", "m14 4 1.25 2.5L18 6",
    "m17 21-3-6h-4", "m17 3-3 6 1.5 3", "M2 12h6.5L10 9",
    "m20 10-1.5 2 1.5 2", "M22 12h-6.5L14 15", "m4 10 1.5 2L4 14",
    "m7 21 3-6-1.5-3", "m7 3 3 6h4",
  ] },
];

export default function RadialChart({ flowers, showLabels = true }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const initialized = useRef(false);
  const [scale, setScale] = useState(1);
  const { t, lang } = useI18n();

  // Keep a ref to t so D3 event handlers always read the current translation
  const tRef = useRef(t);
  tRef.current = t;

  // Track the display scale: rendered pixels / viewBox units
  useEffect(() => {
    if (!svgRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const displayWidth = entry.contentRect.width;
        setScale(displayWidth / SIZE);
      }
    });
    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  // Inverse scale: viewBox units per screen pixel
  const inv = scale > 0 ? 1 / scale : 1;
  const invRef = useRef(inv);
  invRef.current = inv;

  // One-time SVG structure setup
  useEffect(() => {
    if (!svgRef.current || initialized.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg
      .append("g")
      .attr("class", "root")
      .attr("transform", `translate(${CENTER},${CENTER})`);

    g.append("g").attr("class", "cells");
    g.append("g").attr("class", "lines");
    g.append("defs");
    g.append("g").attr("class", "curved-labels");
    g.append("g").attr("class", "month-labels");
    g.append("text")
      .attr("class", "empty-msg")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em");

    // Month label placeholders (text set in language effect)
    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + MONTH_SLICE / 2 + ANGLE_OFFSET;
      g.select(".month-labels")
        .append("text")
        .attr("data-month-idx", i)
        .attr("data-angle", angle)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#c1bcb7");
    }

    // Season markers at boundaries
    g.append("g").attr("class", "season-markers");
    SEASON_ICONS.forEach(({ monthIdx, key, paths, circle, rotate }) => {
      const angle = monthIdx * MONTH_SLICE + ANGLE_OFFSET;
      const rIcon = OUTER_RADIUS + LABEL_OFFSET * 2;
      const rLineStart = OUTER_RADIUS;
      const rLineEnd = rIcon - LABEL_OFFSET * 0.5;

      // Dotted line from chart edge to icon
      g.select(".season-markers")
        .append("line")
        .attr("x1", rLineStart * Math.cos(angle))
        .attr("y1", rLineStart * Math.sin(angle))
        .attr("x2", rLineEnd * Math.cos(angle))
        .attr("y2", rLineEnd * Math.sin(angle))
        .attr("stroke", "#c1bcb7")
        .attr("stroke-dasharray", "2,3")
        .attr("vector-effect", "non-scaling-stroke")
        .style("pointer-events", "none");

      // Icon positioned at rIcon, centered on the 24x24 viewBox
      const x = rIcon * Math.cos(angle);
      const y = rIcon * Math.sin(angle);
      const s = ICON_SIZE / 24;

      const rot = rotate ? `rotate(${rotate},12,12)` : "";
      const icon = g.select(".season-markers")
        .append("g")
        .attr("class", "season-icon")
        .attr("data-season-key", key)
        .attr("data-x", x)
        .attr("data-y", y)
        .attr("data-rotate", rotate || 0)
        .attr("transform", `translate(${x},${y}) scale(${s}) translate(-12,-12) ${rot}`)
        .attr("fill", "none")
        .attr("stroke", "#c1bcb7")
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("vector-effect", "non-scaling-stroke");

      // Invisible hit area for hover
      icon.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", 24).attr("height", 24)
        .attr("fill", "transparent")
        .attr("stroke", "none");

      paths.forEach((d) => icon.append("path").attr("d", d));
      if (circle) {
        icon.append("circle")
          .attr("cx", circle.cx)
          .attr("cy", circle.cy)
          .attr("r", circle.r);
      }

      // Tooltip on icon hover (reads tRef.current for live translations)
      icon
        .style("cursor", "default")
        .style("pointer-events", "all")
        .on("mouseenter", () => {
          const tr = tRef.current;
          const name = tr("seasons." + key + ".name");
          const range = tr("seasons." + key + ".range");
          const svgRect = svgRef.current.getBoundingClientRect();
          const svgScale = svgRect.width / SIZE;
          const tip = d3.select(tooltipRef.current);
          tip.style("opacity", 1)
            .html(`<strong>${name[0].toUpperCase() + name.slice(1)}</strong><br/>${range}`)
            .style("left", `${(x + CENTER) * svgScale + 16}px`)
            .style("top", `${(y + CENTER) * svgScale - 12}px`);
        })
        .on("mouseleave", () => {
          d3.select(tooltipRef.current).style("opacity", 0);
        });
    });

    // Radial divider lines
    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + ANGLE_OFFSET;
      g.select(".lines")
        .append("line")
        .attr("x1", INNER_RADIUS * Math.cos(angle))
        .attr("y1", INNER_RADIUS * Math.sin(angle))
        .attr("x2", OUTER_RADIUS * Math.cos(angle))
        .attr("y2", OUTER_RADIUS * Math.sin(angle))
        .attr("stroke", "#fff")
        .attr("vector-effect", "non-scaling-stroke")
        .style("pointer-events", "none");
    }

    initialized.current = true;
  }, []);

  // Update month label text when language changes
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;
    const months = t("months");
    const g = d3.select(svgRef.current).select(".root");
    g.select(".month-labels")
      .selectAll("text")
      .each(function () {
        const el = d3.select(this);
        const idx = parseInt(el.attr("data-month-idx"));
        el.text(months[idx]);
      });
  }, [t]);

  // Update non-scaling sizes when scale changes
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;
    const g = d3.select(svgRef.current).select(".root");

    // Month label font size and position (fixed 4px gap from outer ring)
    const labelR = OUTER_RADIUS + 24 * inv;
    g.select(".month-labels")
      .selectAll("text")
      .attr("font-size", `${MONTH_LABEL_PX * inv}px`)
      .each(function () {
        const el = d3.select(this);
        const angle = parseFloat(el.attr("data-angle"));
        el.attr("x", labelR * Math.cos(angle))
          .attr("y", labelR * Math.sin(angle));
      });

    // Empty message font size
    g.select(".empty-msg").attr("font-size", `${EMPTY_MSG_PX * inv}px`);

    // Season marker icon scale (non-scaling)
    g.select(".season-markers")
      .selectAll(".season-icon")
      .each(function () {
        const el = d3.select(this);
        const x = el.attr("data-x");
        const y = el.attr("data-y");
        const s = (ICON_SIZE * inv) / 24;
        const r = el.attr("data-rotate");
        const rot = r && r !== "0" ? `rotate(${r},12,12)` : "";
        el.attr("transform", `translate(${x},${y}) scale(${s}) translate(-12,-12) ${rot}`);
      });

    // Curved label font size and stroke
    const curvedTexts = g.select(".curved-labels").selectAll("text");
    if (!curvedTexts.empty()) {
      const labelSize = MONTH_LABEL_PX * inv;
      curvedTexts
        .attr("font-size", labelSize)
        .attr("stroke-width", labelSize * 0.12);
    }

    // Divider line stroke width
    g.select(".lines")
      .selectAll("line")
      .attr("stroke-width", LINE_STROKE_PX);
  }, [inv]);

  // Data-driven updates with transitions
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select(".root");
    const tooltip = d3.select(tooltipRef.current);
    const tr = d3.transition().duration(T_DURATION).ease(d3.easeCubicInOut);
    const months = t("months");

    // Empty message
    g.select(".empty-msg")
      .attr("fill", flowers.length === 0 ? "#c1bcb7" : "none")
      .text(flowers.length === 0 ? t("emptyState") : "");

    // Build flat cell data
    const bandHeight =
      flowers.length > 0
        ? (OUTER_RADIUS - INNER_RADIUS) / flowers.length
        : 0;

    const cellData = [];
    flowers.forEach((flower, flowerIdx) => {
      const innerR = INNER_RADIUS + flowerIdx * bandHeight;
      const outerR = innerR + bandHeight;
      flower.monthStates.forEach((state, monthIdx) => {
        cellData.push({
          key: `${flower.id}--${monthIdx}`,
          flower,
          monthIdx,
          state,
          innerR,
          outerR,
          startAngle: monthIdx * MONTH_SLICE,
          endAngle: (monthIdx + 1) * MONTH_SLICE,
          color: resolveColor(state, flower.colors),
        });
      });
    });

    // Data join
    const cells = g
      .select(".cells")
      .selectAll("path")
      .data(cellData, (d) => d.key);

    // Exit
    cells
      .exit()
      .transition(tr)
      .attrTween("d", arcTweenExit)
      .style("opacity", 0)
      .remove();

    // Enter
    const enter = cells
      .enter()
      .append("path")
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("vector-effect", "non-scaling-stroke")
      .style("cursor", "default")
      .each(function (d) {
        const midR = (d.innerR + d.outerR) / 2;
        this.__prev = {
          innerR: midR,
          outerR: midR,
          startAngle: d.startAngle,
          endAngle: d.endAngle,
        };
      })
      .attr("d", function (d) {
        return arcGen({
          innerRadius: this.__prev.innerR,
          outerRadius: this.__prev.outerR,
          startAngle: d.startAngle,
          endAngle: d.endAngle,
        });
      });

    // Enter + Update
    enter
      .merge(cells)
      .attr("stroke-width", CELL_STROKE_PX)
      .on("mouseenter", function (event, d) {
        const tr = tRef.current;
        const monthLabels = tr("months");
        const flowerName = d.flower.displayName;
        const stateName = tr("states." + d.state);
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${flowerName}</strong><br/><em>${d.flower.scientificName}</em><br/>${monthLabels[d.monthIdx]} · ${stateName}`,
          );
      })
      .on("mousemove", function (event) {
        const svgRect = svgRef.current.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - svgRect.left + 12}px`)
          .style("top", `${event.clientY - svgRect.top - 28}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
      })
      .transition(tr)
      .attr("fill", (d) => d.color)
      .attrTween("d", arcTween);

    // Curved text labels
    const defs = g.select("defs");
    const textGroup = g.select(".curved-labels");

    defs.selectAll("path").remove();
    textGroup.selectAll("text").remove();

    if (showLabels && flowers.length > 0) {
      const labelSize = Math.min(MONTH_LABEL_PX * invRef.current, bandHeight * 0.6);

      flowers.forEach((flower, flowerIdx) => {
        const outerR = INNER_RADIUS + (flowerIdx + 1) * bandHeight;
        const textR = outerR - 5;
        const pathId = `text-path-${flower.id}`;

        defs
          .append("path")
          .attr("id", pathId)
          .attr(
            "d",
            `M 0,${-textR} A ${textR},${textR} 0 1,1 -0.01,${-textR}`,
          );

        textGroup
          .append("text")
          .attr("font-size", labelSize)
          .attr("font-family", "'JetBrains Mono', monospace")
          .attr("dominant-baseline", "hanging")
          .attr("fill", "#fff")
          .attr("opacity", 0)
          .attr("stroke", "rgba(0,0,0,0.4)")
          .attr("stroke-width", labelSize * 0.12)
          .attr("paint-order", "stroke")
          .attr("font-weight", 800)
          .style("pointer-events", "none")
          .append("textPath")
          .attr("href", `#${pathId}`)
          .attr("startOffset", 5)
          .text(flower.displayName);

        textGroup
          .selectAll("text:last-child")
          .transition(tr)
          .attr("opacity", 0.85);
      });
    }
  }, [flowers, showLabels, t]);

  const chartDesc = flowers.length > 0
    ? t("chartDesc", {
        flowers: new Intl.ListFormat(lang, { style: "long", type: "conjunction" })
          .format(flowers.map((f) => f.displayName)),
      })
    : t("emptyState");

  return (
    <div className="radial-chart-wrapper">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="radial-chart-svg"
        role="img"
        aria-labelledby="chart-title chart-desc"
        focusable="false"
      >
        <title id="chart-title">{t("chartTitle")}</title>
        <desc id="chart-desc">{chartDesc}</desc>
      </svg>
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
}
