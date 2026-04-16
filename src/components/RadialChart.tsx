import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { resolveColor } from '../data/colors';
import { useI18n } from '../i18n/I18nContext';
import Button from './ui/button';
import {
  lastDraggedId,
  clearDraggedId,
  bulkChangeIntent,
  clearBulkIntent,
} from '../hooks/gardenStore';
import type { EnrichedFlower, FlowerState } from '../types';

const SIZE = 600;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 260;
const INNER_RADIUS = 40;
const LABEL_OFFSET = 20;
const MONTH_SLICE = (2 * Math.PI) / 12;
const ANGLE_OFFSET = -Math.PI / 2; // January at top
const T_DURATION = 450;

const MONTH_LABEL_PX = 12;
const CELL_STROKE_PX = 1;
const LINE_STROKE_PX = 1.5;
const ICON_SIZE = 16;
// Max extent of non-scaling elements beyond OUTER_RADIUS
const LABEL_EXTENT = 24 + LABEL_OFFSET;

const COLOR_LABEL = '#c1bcb7';
const COLOR_DIVIDER = '#fff';
const COLOR_LABEL_FILL = '#fff';
const COLOR_LABEL_STROKE = 'rgba(0,0,0,0.4)';
const GHOST_FLOWER_COUNT = 4;
const GHOST_BH = (OUTER_RADIUS - INNER_RADIUS) / GHOST_FLOWER_COUNT;
const GHOST_RADII = [
  INNER_RADIUS + 2 * GHOST_BH, // 150 — inner ring (breathing)
  OUTER_RADIUS, // 260 — outer boundary (solid)
];
const COLOR_GHOST = COLOR_LABEL; // match month/season markers

const arcGen = d3.arc();

interface CellDatum {
  key: string;
  flower: EnrichedFlower;
  monthIdx: number;
  state: FlowerState;
  innerR: number;
  outerR: number;
  startAngle: number;
  endAngle: number;
  color: string;
}

interface ArcPrev {
  innerR: number;
  outerR: number;
  startAngle: number;
  endAngle: number;
}

function arcTween(this: SVGPathElement & { __prev?: ArcPrev }, d: CellDatum) {
  const prev: ArcPrev = this.__prev || {
    innerR: (d.innerR + d.outerR) / 2,
    outerR: (d.innerR + d.outerR) / 2,
    startAngle: d.startAngle,
    endAngle: d.endAngle,
  };
  const iInner = d3.interpolate(prev.innerR, d.innerR);
  const iOuter = d3.interpolate(prev.outerR, d.outerR);
  this.__prev = { ...d };
  return (t: number) =>
    arcGen({
      innerRadius: iInner(t),
      outerRadius: iOuter(t),
      startAngle: d.startAngle,
      endAngle: d.endAngle,
    }) ?? '';
}

interface SeasonIcon {
  monthIdx: number;
  key: string;
  paths: string[];
  circle?: { cx: number; cy: number; r: number };
  rotate?: number;
}

const SEASON_ICONS: SeasonIcon[] = [
  {
    monthIdx: 2,
    key: 'spring',
    paths: [
      'M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5',
      'M12 7.5V9',
      'M7.5 12H9',
      'M16.5 12H15',
      'M12 16.5V15',
      'm8 8 1.88 1.88',
      'M14.12 9.88 16 8',
      'm8 16 1.88-1.88',
      'M14.12 14.12 16 16',
    ],
    circle: { cx: 12, cy: 12, r: 3 },
  },
  {
    monthIdx: 5,
    key: 'summer',
    paths: [
      'M12 .5v2',
      'M12 21.5v2',
      'm3.87 3.87 1.41 1.41',
      'm18.72 18.72 1.41 1.41',
      'M.5 12h2',
      'M21.5 12h2',
      'm5.28 18.72-1.41 1.41',
      'm20.13 3.87-1.41 1.41',
    ],
    circle: { cx: 12, cy: 12, r: 5.5 },
  },
  {
    monthIdx: 8,
    key: 'autumn',
    paths: [
      'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
      'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
    ],
    rotate: 90,
  },
  {
    monthIdx: 11,
    key: 'winter',
    paths: [
      'm10 20-1.25-2.5L6 18',
      'M10 4 8.75 6.5 6 6',
      'm14 20 1.25-2.5L18 18',
      'm14 4 1.25 2.5L18 6',
      'm17 21-3-6h-4',
      'm17 3-3 6 1.5 3',
      'M2 12h6.5L10 9',
      'm20 10-1.5 2 1.5 2',
      'M22 12h-6.5L14 15',
      'm4 10 1.5 2L4 14',
      'm7 21 3-6-1.5-3',
      'm7 3 3 6h4',
    ],
  },
];

/** Position a tooltip relative to its container, flipping to avoid viewport overflow. */
function positionTooltip(
  tip: HTMLDivElement,
  svgRect: DOMRect,
  anchorLeft: number,
  anchorTop: number,
) {
  tip.style.left = `${anchorLeft}px`;
  tip.style.top = `${anchorTop}px`;

  const tipRect = tip.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 8;

  // Flip right → left if overflowing viewport right
  if (tipRect.right > vw - pad) {
    tip.style.left = `${anchorLeft - tipRect.width - 24}px`;
  }
  // Shift up if overflowing viewport bottom
  if (tipRect.bottom > vh - pad) {
    tip.style.top = `${anchorTop - tipRect.height - 24}px`;
  }
  // Clamp to viewport left/top (relative to container)
  const recheckRect = tip.getBoundingClientRect();
  if (recheckRect.left < pad) {
    tip.style.left = `${pad - svgRect.left}px`;
  }
  if (recheckRect.top < pad) {
    tip.style.top = `${pad - svgRect.top}px`;
  }
}

interface RadialChartProps {
  flowers: EnrichedFlower[];
  showLabels?: boolean;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  onEmptyAction?: () => void;
}

export default function RadialChart({
  flowers,
  showLabels = true,
  svgRef: externalSvgRef,
  onEmptyAction,
}: RadialChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const measured = useRef(false);
  const initialLoad = useRef(true);
  const prevOrderRef = useRef<string[]>([]);
  const [displayWidth, setDisplayWidth] = useState(SIZE);
  const { t, lang } = useI18n();

  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!svgRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        measured.current = true;
        setDisplayWidth(entry.contentRect.width);
      }
    });
    observer.observe(svgRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // ViewBox sized so labels fit exactly at the edge
  const viewBoxSize =
    displayWidth > 2 * LABEL_EXTENT
      ? Math.max(
          SIZE,
          (2 * OUTER_RADIUS * displayWidth) / (displayWidth - 2 * LABEL_EXTENT),
        )
      : SIZE;
  const viewBoxPad = (viewBoxSize - SIZE) / 2;
  const scale = displayWidth / viewBoxSize;
  const inv = scale > 0 ? 1 / scale : 1;
  const invRef = useRef(inv);
  invRef.current = inv;

  // One-time SVG structure setup
  useEffect(() => {
    if (!svgRef.current || initialized.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg
      .append('g')
      .attr('class', 'root')
      .attr('transform', `translate(${CENTER},${CENTER})`);

    // Ghost rings first (behind everything) for the empty state skeleton
    const ghostG = g
      .append('g')
      .attr('class', 'ghost-rings')
      .attr('opacity', 0);
    GHOST_RADII.forEach((r, i) => {
      ghostG
        .append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', COLOR_GHOST)
        .attr('stroke-dasharray', '2,3')
        .attr('stroke-width', 1)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('class', i === 0 ? 'max-sm:hidden' : null);
    });

    g.append('g').attr('class', 'cells');
    g.append('g').attr('class', 'lines');
    g.append('defs');
    g.append('g').attr('class', 'curved-labels');
    g.append('g').attr('class', 'cells-foreground');
    g.append('g').attr('class', 'labels-foreground');
    g.append('g').attr('class', 'month-labels');

    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + MONTH_SLICE / 2 + ANGLE_OFFSET;
      g.select('.month-labels')
        .append('text')
        .attr('data-month-idx', i)
        .attr('data-angle', angle)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', COLOR_LABEL)
        .style('opacity', 0);
    }

    g.append('g').attr('class', 'season-markers');
    SEASON_ICONS.forEach(({ monthIdx, key, paths, circle, rotate }) => {
      const angle = monthIdx * MONTH_SLICE + ANGLE_OFFSET;
      const rIcon = OUTER_RADIUS + LABEL_OFFSET * 2;
      const rLineStart = OUTER_RADIUS;
      const rLineEnd = rIcon - LABEL_OFFSET * 0.5;

      g.select('.season-markers')
        .append('line')
        .attr('class', 'season-line')
        .attr('data-angle', angle)
        .attr('x1', rLineStart * Math.cos(angle))
        .attr('y1', rLineStart * Math.sin(angle))
        .attr('x2', rLineEnd * Math.cos(angle))
        .attr('y2', rLineEnd * Math.sin(angle))
        .attr('stroke', COLOR_LABEL)
        .attr('stroke-dasharray', '2,3')
        .attr('vector-effect', 'non-scaling-stroke')
        .style('pointer-events', 'none');

      const x = rIcon * Math.cos(angle);
      const y = rIcon * Math.sin(angle);
      const s = ICON_SIZE / 24;

      const rot = rotate ? `rotate(${rotate},12,12)` : '';
      const icon = g
        .select('.season-markers')
        .append('g')
        .attr('class', 'season-icon')
        .attr('data-season-key', key)
        .attr('data-angle', angle)
        .attr('data-rotate', rotate || 0)
        .attr(
          'transform',
          `translate(${x},${y}) scale(${s}) translate(-12,-12) ${rot}`,
        )
        .attr('fill', 'none')
        .attr('stroke', COLOR_LABEL)
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('vector-effect', 'non-scaling-stroke')
        .style('opacity', 0);

      icon
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 24)
        .attr('height', 24)
        .attr('fill', 'transparent')
        .attr('stroke', 'none');

      paths.forEach((d) => icon.append('path').attr('d', d));
      if (circle) {
        icon
          .append('circle')
          .attr('cx', circle.cx)
          .attr('cy', circle.cy)
          .attr('r', circle.r);
      }

      icon
        .style('cursor', 'default')
        .style('pointer-events', 'all')
        .on('mouseenter', function () {
          const tr = tRef.current;
          const name = tr('seasons.' + key + '.name') as string;
          const range = tr('seasons.' + key + '.range') as string;
          const svgRect = svgRef.current!.getBoundingClientRect();
          const iconRect = this.getBoundingClientRect();
          const tip = tooltipRef.current!;
          tip.style.opacity = '1';
          tip.innerHTML = `<strong>${(name[0] ?? '').toUpperCase() + name.slice(1)}</strong><br/>${range}`;
          positionTooltip(
            tip,
            svgRect,
            iconRect.left - svgRect.left + iconRect.width / 2 + 12,
            iconRect.top - svgRect.top + iconRect.height / 2 - 12,
          );
        })
        .on('mouseleave', () => {
          d3.select(tooltipRef.current).style('opacity', 0);
        });
    });

    for (let i = 0; i < 12; i++) {
      const angle = i * MONTH_SLICE + ANGLE_OFFSET;
      g.select('.lines')
        .append('line')
        .attr('x1', INNER_RADIUS * Math.cos(angle))
        .attr('y1', INNER_RADIUS * Math.sin(angle))
        .attr('x2', OUTER_RADIUS * Math.cos(angle))
        .attr('y2', OUTER_RADIUS * Math.sin(angle))
        .attr('stroke', COLOR_DIVIDER)
        .attr('vector-effect', 'non-scaling-stroke')
        .style('pointer-events', 'none');
    }

    initialized.current = true;
  }, []);

  // Update translatable text when language changes
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;
    const months = t('months') as string[];
    const g = d3.select(svgRef.current).select('.root');
    g.select('.month-labels')
      .selectAll('text')
      .each(function () {
        const el = d3.select(this);
        const idx = parseInt(el.attr('data-month-idx'));
        el.text(months[idx] ?? '');
      });
  }, [t]);

  // Update non-scaling sizes when scale changes
  useEffect(() => {
    if (!svgRef.current || !initialized.current || !measured.current) return;
    const g = d3.select(svgRef.current).select('.root');

    const labelR = OUTER_RADIUS + 24 * inv;
    g.select('.month-labels')
      .selectAll('text')
      .attr('font-size', `${MONTH_LABEL_PX * inv}px`)
      .style('opacity', 1)
      .each(function () {
        const el = d3.select(this);
        const angle = parseFloat(el.attr('data-angle'));
        el.attr('x', labelR * Math.cos(angle)).attr(
          'y',
          labelR * Math.sin(angle),
        );
      });

    const iconR = labelR + LABEL_OFFSET * inv;
    const lineEndR = iconR - LABEL_OFFSET * 0.5 * inv;
    g.select('.season-markers')
      .selectAll('.season-line')
      .each(function () {
        const el = d3.select(this);
        const angle = parseFloat(el.attr('data-angle'));
        el.attr('x2', lineEndR * Math.cos(angle)).attr(
          'y2',
          lineEndR * Math.sin(angle),
        );
      });
    g.select('.season-markers')
      .selectAll('.season-icon')
      .each(function () {
        const el = d3.select(this);
        const angle = parseFloat(el.attr('data-angle'));
        const x = iconR * Math.cos(angle);
        const y = iconR * Math.sin(angle);
        const s = (ICON_SIZE * inv) / 24;
        const r = el.attr('data-rotate');
        const rot = r && r !== '0' ? `rotate(${r},12,12)` : '';
        el.attr(
          'transform',
          `translate(${x},${y}) scale(${s}) translate(-12,-12) ${rot}`,
        ).style('opacity', 1);
      });

    const curvedTexts = g.select('.curved-labels').selectAll('text');
    if (!curvedTexts.empty()) {
      const labelSize = MONTH_LABEL_PX * inv;
      curvedTexts
        .attr('font-size', labelSize)
        .attr('stroke-width', labelSize * 0.12);
      if (initialLoad.current) {
        curvedTexts.attr('opacity', 0.85);
        initialLoad.current = false;
      }
    }

    g.select('.lines').selectAll('line').attr('stroke-width', LINE_STROKE_PX);
  }, [inv]);

  // Data-driven updates with transitions
  useEffect(() => {
    if (!svgRef.current || !initialized.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('.root');
    const tooltip = d3.select(tooltipRef.current);
    const tr = d3.transition().duration(T_DURATION).ease(d3.easeCubicInOut);

    // Recover any hero elements stranded in foreground layers by an interrupted
    // transition (the on('end') handler never fired).
    const cellsNode = g.select('.cells').node()! as Element;
    const curvedLabelsNode = g.select('.curved-labels').node()! as Element;
    g.select('.cells-foreground')
      .selectAll('path')
      .each(function () {
        cellsNode.appendChild(this as Element);
      });
    g.select('.labels-foreground')
      .selectAll('text')
      .each(function () {
        curvedLabelsNode.appendChild(this as Element);
      });

    const ghostRings = g.select('.ghost-rings');
    if (flowers.length === 0) {
      if (prevOrderRef.current.length === 0) {
        // First load: show immediately (match month/season label timing)
        ghostRings.attr('opacity', 1);
      } else {
        // Removing flowers: outer circle fades in, inner circle waits for text
        ghostRings.transition().duration(T_DURATION).attr('opacity', 1);
        ghostRings
          .select('circle:first-child')
          .attr('opacity', 0)
          .transition()
          .delay(500)
          .duration(300)
          .attr('opacity', 1);
      }
    } else {
      ghostRings.transition().duration(T_DURATION).attr('opacity', 0);
    }

    const bandHeight =
      flowers.length > 0 ? (OUTER_RADIUS - INNER_RADIUS) / flowers.length : 0;

    const cellData: CellDatum[] = [];
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

    // Detect pure reorder (same flower set, different order)
    const nextOrder = flowers.map((f) => f.id);
    const prevOrder = prevOrderRef.current;
    const isReorder =
      prevOrder.length > 1 &&
      prevOrder.length === nextOrder.length &&
      prevOrder.some((id, i) => nextOrder[i] !== id) &&
      prevOrder.every((id) => nextOrder.includes(id));

    // Pre-compute per-flower slot interpolation for gap-free reorder
    let flowerSlots: Map<string, { from: number; to: number }> | null = null;
    if (isReorder) {
      flowerSlots = new Map();
      const prevIdxMap = new Map(prevOrder.map((id, i) => [id, i]));
      for (const [i, id] of nextOrder.entries()) {
        flowerSlots.set(id, {
          from: prevIdxMap.get(id)!,
          to: i,
        });
      }
    }

    // Direction-aware easing for reorder: outward leads (ease-out), inward follows (ease-in)
    const reorderEase = (slot: { from: number; to: number }, v: number) => {
      if (slot.to > slot.from) return 1 - (1 - v) ** 2; // outward
      if (slot.to < slot.from) return v ** 2; // inward
      return v;
    };

    // Hero: the dragged flower (from intent signal), falling back to max-mover heuristic.
    // Consume the signal immediately so it doesn't persist across non-reorder updates.
    const dragIntent = lastDraggedId;
    clearDraggedId();
    let reorderHeroId: string | null = null;
    if (flowerSlots) {
      if (dragIntent && flowerSlots.has(dragIntent)) {
        reorderHeroId = dragIntent;
      } else {
        let maxMove = 0;
        for (const [id, s] of flowerSlots) {
          const move = Math.abs(s.to - s.from);
          if (move > maxMove || (move === maxMove && s.to > s.from)) {
            maxMove = move;
            reorderHeroId = id;
          }
        }
      }
    }

    const cells = g
      .select('.cells')
      .selectAll<SVGPathElement, CellDatum>('path')
      .data(cellData, (d) => d.key);

    const exitCells = cells.exit<CellDatum>();
    const hasExit = !exitCells.empty();
    // Compute boundary-aligned collapse targets for exit flowers.
    // Middle/outer exits collapse to the new boundary where adjacent flowers
    // will meet, keeping ring interpolation perfectly contiguous.
    // Innermost exits use midR for the familiar "shrink to center" visual.
    const collapseTargets = new Map<string, number>();
    if (hasExit) {
      const exitIds = new Set(exitCells.data().map((d) => d.flower.id));
      for (const exitId of exitIds) {
        const exitIdx = prevOrder.indexOf(exitId);
        if (exitIdx <= 0) continue; // innermost: skip, falls back to midR
        let belowCount = 0;
        for (let i = 0; i < exitIdx; i++) {
          const id = prevOrder[i];
          if (id !== undefined && nextOrder.includes(id)) belowCount++;
        }
        collapseTargets.set(exitId, INNER_RADIUS + belowCount * bandHeight);
      }
    }

    // Detect bulk change: explicit intent (reset/import/save) or many flowers changing
    const isBulkIntent = bulkChangeIntent;
    clearBulkIntent();
    const enterFlowerCount = new Set(
      cells
        .enter()
        .data()
        .map((d: CellDatum) => d.flower.id),
    ).size;
    const exitFlowerCount = new Set(exitCells.data().map((d) => d.flower.id))
      .size;
    const isBulk =
      !isReorder &&
      prevOrder.length > 0 &&
      (isBulkIntent || enterFlowerCount + exitFlowerCount > 1);

    if (isBulk) {
      // Bulk dissolve: exit lingers then fades, enter materializes with overlap
      exitCells
        .transition()
        .duration(450)
        .ease(d3.easeCubicInOut as any)
        .attr('opacity', 0)
        .remove();
    } else {
      // Per-element exit: collapse to boundary-aligned target
      exitCells
        .transition(tr as any)
        .attrTween('d', function (this: any, d: CellDatum) {
          const prev: ArcPrev = this.__prev || d;
          const targetR =
            collapseTargets.get(d.flower.id) ?? (prev.innerR + prev.outerR) / 2;
          const iInner = d3.interpolate(prev.innerR, targetR);
          const iOuter = d3.interpolate(prev.outerR, targetR);
          return (v: number) =>
            arcGen({
              innerRadius: iInner(v),
              outerRadius: iOuter(v),
              startAngle: d.startAngle,
              endAngle: d.endAngle,
            }) ?? '';
        } as any)
        .remove();
    }

    const enter = cells
      .enter()
      .append('path')
      .attr('fill', (d) => d.color)
      .attr('stroke', COLOR_DIVIDER)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('cursor', 'default')
      .each(function (d) {
        if (isBulk) {
          // Bulk: start at final position (dissolve, not expand)
          (this as any).__prev = { ...d };
        } else {
          // Per-element: start at midpoint (expand animation)
          const midR = (d.innerR + d.outerR) / 2;
          (this as any).__prev = {
            innerR: midR,
            outerR: midR,
            startAngle: d.startAngle,
            endAngle: d.endAngle,
          };
        }
      })
      .attr('d', function (d) {
        return (
          arcGen({
            innerRadius: (this as any).__prev.innerR,
            outerRadius: (this as any).__prev.outerR,
            startAngle: d.startAngle,
            endAngle: d.endAngle,
          }) ?? ''
        );
      })
      .attr('opacity', isBulk ? 0 : 1);

    const merged = enter
      .merge(cells)
      .attr('stroke-width', CELL_STROKE_PX)
      .on('mouseenter', function (_event: MouseEvent, d: CellDatum) {
        const translate = tRef.current;
        const monthLabels = translate('months') as string[];
        const flowerName = d.flower.displayName;
        const stateName = translate('states.' + d.state) as string;
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${flowerName}</strong>${d.flower.scientificName ? `<br/><em>${d.flower.scientificName}</em>` : ''}<br/>${monthLabels[d.monthIdx]} · ${stateName}`,
          );
      })
      .on('mousemove', function (event: MouseEvent) {
        const svgRect = svgRef.current!.getBoundingClientRect();
        positionTooltip(
          tooltipRef.current!,
          svgRect,
          event.clientX - svgRect.left + 12,
          event.clientY - svgRect.top - 28,
        );
      })
      .on('mouseleave', function () {
        tooltip.style('opacity', 0);
      });

    if (isReorder && flowerSlots) {
      // Gap-free reorder animation:
      // - Hero (the dragged flower, inferred as the max-mover) is a ring
      //   in the foreground layer (above labels), with its label above it.
      // - Everything else is filled circles (background, below labels).
      // - Direction-aware easing: outward ease-out, inward ease-in.
      const slots = flowerSlots;
      const reorderTr = d3
        .transition()
        .duration(T_DURATION)
        .ease(d3.easeLinear);

      const easedSlot = (slot: { from: number; to: number }, v: number) =>
        slot.from + (slot.to - slot.from) * reorderEase(slot, v);

      const isHero = (id: string) => id === reorderHeroId;

      // Move hero cells to foreground (above labels),
      // hero label to labels-foreground (above the ring)
      const fgNode = g.select('.cells-foreground').node()! as Element;
      const lfgNode = g.select('.labels-foreground').node()! as Element;
      const bgNode = g.select('.cells').node()! as Element;
      const labelsNode = g.select('.curved-labels').node()! as Element;
      merged.each(function (d: CellDatum) {
        if (isHero(d.flower.id)) fgNode.appendChild(this);
      });
      // Hero label is moved to labels-foreground AFTER the label data join
      // (see below) to avoid creating a duplicate via the enter selection.

      // Sort background circles by outerR descending
      g.select('.cells')
        .selectAll<SVGPathElement, CellDatum>('path')
        .sort((a, b) => {
          const fromA = slots.get(a.flower.id)?.from ?? 0;
          const fromB = slots.get(b.flower.id)?.from ?? 0;
          if (fromA !== fromB) return fromB - fromA;
          return a.monthIdx - b.monthIdx;
        });

      let lastV = -1;

      merged
        .transition(reorderTr as any)
        .attr('fill', (d: CellDatum) => d.color)
        .attrTween('d', function (this: any, d: CellDatum) {
          this.__prev = { ...d };
          const slot = slots.get(d.flower.id)!;
          const hero = isHero(d.flower.id);
          return (v: number) => {
            // Re-sort background circles every frame
            if (v !== lastV) {
              lastV = v;
              g.select('.cells')
                .selectAll<SVGPathElement, CellDatum>('path')
                .sort((a, b) => {
                  const sA = slots.get(a.flower.id)!;
                  const sB = slots.get(b.flower.id)!;
                  const oA = easedSlot(sA, v);
                  const oB = easedSlot(sB, v);
                  if (Math.abs(oA - oB) > 1e-9) return oB - oA;
                  if (sA.to !== sB.to) return sB.to - sA.to;
                  return a.monthIdx - b.monthIdx;
                });
            }
            const s = easedSlot(slot, v);
            return (
              arcGen({
                innerRadius: hero
                  ? INNER_RADIUS + s * bandHeight
                  : INNER_RADIUS,
                outerRadius: INNER_RADIUS + (s + 1) * bandHeight,
                startAngle: d.startAngle,
                endAngle: d.endAngle,
              }) ?? ''
            );
          };
        } as any)
        .on('end', function (this: any, d: CellDatum) {
          // Move hero cells and labels back to their home groups
          if (isHero(d.flower.id)) {
            bgNode.appendChild(this);
            lfgNode.querySelectorAll('text').forEach((txt) => {
              labelsNode.appendChild(txt);
            });
          }
          d3.select(this).attr(
            'd',
            arcGen({
              innerRadius: d.innerR,
              outerRadius: d.outerR,
              startAngle: d.startAngle,
              endAngle: d.endAngle,
            }) ?? '',
          );
          this.__prev = { ...d };
        });
    } else if (isBulk) {
      // Bulk dissolve: surviving rings slide first, new rings fade in after
      const updateTr = d3
        .transition()
        .duration(400)
        .delay(200)
        .ease(d3.easeCubicInOut);
      const enterTr = d3
        .transition()
        .duration(450)
        .delay(600)
        .ease(d3.easeCubicOut);

      // Surviving flowers: slide to new positions
      cells
        .transition(updateTr as any)
        .attr('fill', (d: CellDatum) => d.color)
        .attrTween('d', arcTween as any);

      // New flowers: appear at final position after survivors settle
      enter
        .transition(enterTr as any)
        .attr('fill', (d: CellDatum) => d.color)
        .attr('opacity', 1)
        .attrTween('d', arcTween as any);
    } else {
      // Per-element (single add/remove): normal ring interpolation.
      // Gap-free because entering flowers expand from the boundary midpoint,
      // and exiting flowers collapse to the boundary-aligned target.
      enter
        .merge(cells)
        .transition(tr as any)
        .attr('fill', (d: CellDatum) => d.color)
        .attrTween('d', arcTween as any);
    }

    // Ensure correct Z-order after any DOM reordering:
    // cells < curved-labels < cells-foreground < labels-foreground < month-labels < season-markers
    g.select('.curved-labels').raise();
    g.select('.cells-foreground').raise();
    g.select('.labels-foreground').raise();
    g.select('.month-labels').raise();
    g.select('.season-markers').raise();

    // Curved text labels
    const defs = g.select('defs');
    const textGroup = g.select('.curved-labels');
    const labelSize = Math.min(
      MONTH_LABEL_PX * invRef.current,
      bandHeight * 0.6,
    );

    interface LabelDatum {
      id: string;
      displayName: string;
      textR: number;
    }

    function arcPath(r: number): string {
      return `M 0,${-r} A ${r},${r} 0 1,1 -0.01,${-r}`;
    }

    const labelData: LabelDatum[] =
      showLabels && flowers.length > 0
        ? flowers.map((flower, i) => ({
            id: flower.id,
            displayName: flower.displayName,
            textR: INNER_RADIUS + (i + 1) * bandHeight - 5,
          }))
        : [];

    const defPaths = defs
      .selectAll<SVGPathElement, LabelDatum>('path')
      .data(labelData, (d) => d.id);
    if (isBulk) {
      defPaths.exit().transition().duration(450).remove();
    } else {
      defPaths
        .exit()
        .transition(tr as any)
        .remove();
    }
    const defPathsEnter = defPaths
      .enter()
      .append('path')
      .attr('id', (d) => `text-path-${d.id}`)
      .attr('d', (d) => arcPath(d.textR))
      .each(function (d) {
        (this as any).__prevR = d.textR;
      });
    const defPathsMerged = defPathsEnter.merge(defPaths);

    if (isReorder && flowerSlots) {
      const slots = flowerSlots;
      const labelReorderTr = d3
        .transition()
        .duration(T_DURATION)
        .ease(d3.easeLinear);
      defPathsMerged
        .transition(labelReorderTr as any)
        .attrTween('d', function (this: any, d: LabelDatum) {
          this.__prevR = d.textR;
          const slot = slots.get(d.id)!;
          return (v: number) => {
            const s = slot.from + (slot.to - slot.from) * reorderEase(slot, v);
            return arcPath(INNER_RADIUS + (s + 1) * bandHeight - 5);
          };
        } as any)
        .on('end', function (d: LabelDatum) {
          (this as any).__prevR = d.textR;
        });
    } else if (isBulk) {
      const bulkLabelUpdateTr = d3
        .transition()
        .duration(400)
        .delay(200)
        .ease(d3.easeCubicInOut);
      // Surviving label paths slide with their rings
      defPaths
        .transition(bulkLabelUpdateTr as any)
        .attrTween('d', function (d: LabelDatum) {
          const prev = (this as any).__prevR ?? d.textR;
          const interp = d3.interpolate(prev, d.textR);
          return (v: number) => arcPath(interp(v));
        })
        .on('end', function (d: LabelDatum) {
          (this as any).__prevR = d.textR;
        });
      // New label paths are already at final position (set in enter above)
      defPathsEnter.each(function (d) {
        (this as any).__prevR = d.textR;
      });
    } else {
      defPathsMerged
        .transition(tr as any)
        .attrTween('d', function (d: LabelDatum) {
          const prev = (this as any).__prevR ?? d.textR;
          const interp = d3.interpolate(prev, d.textR);
          return (v: number) => arcPath(interp(v));
        })
        .on('end', function (d: LabelDatum) {
          (this as any).__prevR = d.textR;
        });
    }

    const texts = textGroup
      .selectAll<SVGTextElement, LabelDatum>('text')
      .data(labelData, (d) => d.id);

    texts
      .exit()
      .transition()
      .duration(isBulk ? 450 : 100)
      .attr('opacity', 0)
      .remove();

    const textsEnter = texts
      .enter()
      .append('text')
      .attr('font-size', labelSize)
      .attr('font-family', "'JetBrains Mono Variable', monospace")
      .attr('dominant-baseline', 'hanging')
      .attr('fill', COLOR_LABEL_FILL)
      .attr('opacity', 0)
      .attr('stroke', COLOR_LABEL_STROKE)
      .attr('stroke-width', labelSize * 0.12)
      .attr('paint-order', 'stroke')
      .attr('font-weight', 800)
      .style('pointer-events', 'none');

    textsEnter
      .append('textPath')
      .attr('href', (d) => `#text-path-${d.id}`)
      .attr('startOffset', 5)
      .text((d) => d.displayName);

    if (!initialLoad.current) {
      if (isBulk) {
        // Bulk: labels appear after new rings have faded in
        textsEnter
          .transition()
          .delay(800)
          .duration(400)
          .ease(d3.easeCubicInOut)
          .attr('opacity', 0.85);
      } else {
        textsEnter
          .transition()
          .delay(T_DURATION * 0.5)
          .duration(T_DURATION * 0.6)
          .ease(d3.easeCubicInOut)
          .attr('opacity', 0.85);
      }
    }

    texts.select('textPath').text((d) => d.displayName);
    texts.attr('font-size', labelSize).attr('stroke-width', labelSize * 0.12);

    // Move hero label above the foreground ring (after data join to avoid duplicates)
    if (isReorder && reorderHeroId) {
      const lfgNode = g.select('.labels-foreground').node()! as Element;
      const hId = reorderHeroId;
      g.select('.curved-labels')
        .selectAll<SVGTextElement, LabelDatum>('text')
        .each(function (d) {
          if (d.id === hId) lfgNode.appendChild(this);
        });
    }

    prevOrderRef.current = nextOrder;
  }, [flowers, showLabels]);

  const chartDesc =
    flowers.length > 0
      ? t('chartDesc', {
          flowers: new Intl.ListFormat(lang, {
            style: 'long',
            type: 'conjunction',
          }).format(flowers.map((f) => f.displayName)),
        })
      : t('emptyState');

  return (
    <div className="relative w-full max-w-[min(100%,calc(100dvh-4rem))] aspect-square mx-auto">
      <svg
        ref={(el) => {
          svgRef.current = el;
          if (externalSvgRef) {
            externalSvgRef.current = el;
          }
        }}
        viewBox={`${-viewBoxPad} ${-viewBoxPad} ${viewBoxSize} ${viewBoxSize}`}
        className="radial-chart-svg block w-full h-full"
        role="img"
        aria-label={`${t('chartTitle') as string} — ${chartDesc as string}`}
        focusable="false"
      />
      {flowers.length === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none"
          style={
            prevOrderRef.current.length > 0
              ? { animation: 'fade-in 300ms ease-out 500ms both' }
              : undefined
          }
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-sm font-bold lowercase tracking-[0.03em] text-fg">
              {t('emptyTitle') as string}
            </h2>
            <p className="max-w-48 text-xs text-muted lowercase tracking-[0.03em]">
              {t('emptyDescription') as string}
            </p>
          </div>
          {onEmptyAction && (
            <Button
              variant="solid"
              round
              size="md"
              className="pointer-events-auto"
              onClick={onEmptyAction}
            >
              {t('emptyCta') as string}
            </Button>
          )}
        </div>
      )}
      <div
        ref={tooltipRef}
        className="absolute z-[200] py-1.5 px-2.5 text-2xs leading-[1.5] text-surface whitespace-nowrap pointer-events-none bg-fg rounded-lg opacity-0 transition-opacity duration-[0.12s] [&_strong]:font-extrabold"
      />
    </div>
  );
}
