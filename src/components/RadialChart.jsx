import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { MONTH_LABELS } from "../data/months.js";
import { resolveColor } from "../data/colors.js";

const SIZE = 600;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 260;
const INNER_RADIUS = 40;
const LABEL_OFFSET = 20;
const MONTH_SLICE = (2 * Math.PI) / 12;
const ANGLE_OFFSET = -Math.PI / 2; // January at top
const T_DURATION = 450;

const arcGen = d3.arc();

function arcParams(d) {
  return {
    innerRadius: d.innerR,
    outerRadius: d.outerR,
    startAngle: d.startAngle,
    endAngle: d.endAngle,
  };
}

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

export default function RadialChart({ flowers, showLabels = true }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const initialized = useRef(false);

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
      .attr("dy", "0.35em")
      .attr("font-size", "12px");

    // Static month labels
    MONTH_LABELS.forEach((label, i) => {
      const angle = i * MONTH_SLICE + MONTH_SLICE / 2 + ANGLE_OFFSET;
      const r = OUTER_RADIUS + LABEL_OFFSET;
      g.select(".month-labels")
        .append("text")
        .attr("x", r * Math.cos(angle))
        .attr("y", r * Math.sin(angle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "11px")
        .attr("fill", "#aaa")
        .text(label.toLowerCase());
    });

    // Static radial divider lines
    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + ANGLE_OFFSET;
      g.select(".lines")
        .append("line")
        .attr("x1", INNER_RADIUS * Math.cos(angle))
        .attr("y1", INNER_RADIUS * Math.sin(angle))
        .attr("x2", OUTER_RADIUS * Math.cos(angle))
        .attr("y2", OUTER_RADIUS * Math.sin(angle))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none");
    }

    initialized.current = true;
  }, []);

  // Data-driven updates with transitions
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select(".root");
    const tooltip = d3.select(tooltipRef.current);
    const t = d3.transition().duration(T_DURATION).ease(d3.easeCubicInOut);

    // Empty message
    g.select(".empty-msg")
      .attr("fill", flowers.length === 0 ? "#ccc" : "none")
      .text(flowers.length === 0 ? "select flowers to begin" : "");

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
      .transition(t)
      .attrTween("d", arcTweenExit)
      .style("opacity", 0)
      .remove();

    // Enter
    const enter = cells
      .enter()
      .append("path")
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "default")
      .each(function (d) {
        // Start collapsed at midpoint
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
      .on("mouseenter", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.flower.name}</strong><br/>${MONTH_LABELS[d.monthIdx].toLowerCase()} · ${d.state}`,
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
      .transition(t)
      .attr("fill", (d) => d.color)
      .attrTween("d", arcTween);

    // Curved text labels
    const defs = g.select("defs");
    const textGroup = g.select(".curved-labels");

    defs.selectAll("path").remove();
    textGroup.selectAll("text").remove();

    if (showLabels && flowers.length > 0) {
      flowers.forEach((flower, flowerIdx) => {
        const midR = INNER_RADIUS + (flowerIdx + 0.5) * bandHeight;
        const pathId = `text-path-${flower.id}`;

        defs
          .append("path")
          .attr("id", pathId)
          .attr(
            "d",
            `M 0,${-midR} A ${midR},${midR} 0 1,1 -0.01,${-midR}`,
          );

        textGroup
          .append("text")
          .attr("font-size", Math.min(11, bandHeight * 0.6))
          .attr("fill", "#fff")
          .attr("fill-opacity", 0)
          .attr("font-weight", 500)
          .style("pointer-events", "none")
          .append("textPath")
          .attr("href", `#${pathId}`)
          .attr("startOffset", "0%")
          .text(flower.name);

        textGroup
          .selectAll("text:last-child")
          .transition(t)
          .attr("fill-opacity", 0.85);
      });
    }
  }, [flowers, showLabels]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div ref={tooltipRef} className="chart-tooltip" />
    </div>
  );
}
