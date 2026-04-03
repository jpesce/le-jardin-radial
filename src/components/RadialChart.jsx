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

export default function RadialChart({ flowers }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${CENTER},${CENTER})`);

    if (flowers.length === 0) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#999")
        .attr("font-size", "14px")
        .text("Select flowers to begin");
      return;
    }

    const bandHeight =
      (OUTER_RADIUS - INNER_RADIUS) / flowers.length;

    const arc = d3.arc();

    // Draw cells
    flowers.forEach((flower, flowerIdx) => {
      const innerR = INNER_RADIUS + flowerIdx * bandHeight;
      const outerR = innerR + bandHeight;

      flower.monthStates.forEach((state, monthIdx) => {
        const startAngle = monthIdx * MONTH_SLICE;
        const endAngle = startAngle + MONTH_SLICE;
        const color = resolveColor(state, flower.colors);

        g.append("path")
          .attr(
            "d",
            arc({
              innerRadius: innerR,
              outerRadius: outerR,
              startAngle,
              endAngle,
            }),
          )
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      });
    });

    // Month labels
    MONTH_LABELS.forEach((label, i) => {
      const angle = i * MONTH_SLICE + MONTH_SLICE / 2 + ANGLE_OFFSET;
      const r = OUTER_RADIUS + LABEL_OFFSET;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "12px")
        .attr("fill", "#666")
        .text(label);
    });

    // Radial divider lines (month boundaries)
    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + ANGLE_OFFSET;
      const x1 = INNER_RADIUS * Math.cos(angle);
      const y1 = INNER_RADIUS * Math.sin(angle);
      const x2 = OUTER_RADIUS * Math.cos(angle);
      const y2 = OUTER_RADIUS * Math.sin(angle);

      g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    }
  }, [flowers]);

  return (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
