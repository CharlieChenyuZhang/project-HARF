"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export type Share = { label: string; fraction: number; percent: number; mine: boolean };

const TONE_COLORS: Record<string, string> = {
  "Mostly negative": "#b4761a",
  Mixed: "#d6b37a",
  Neutral: "#b4babf",
  "Mostly positive": "#0f8f85",
};
const CATEGORY_COLORS = ["#5561c4", "#b4761a", "#0f8f85", "#8a5fb0", "#5f9c4f"];
const MINE_COLOR = "var(--accent)";
const REST_COLOR = "var(--rule)";
const MAX_CATEGORIES = CATEGORY_COLORS.length;

type Part = Share & { part: number; color: string };

/** Answers as parts of one whole. Hidden small groups become a grey remainder instead of inflating the rest. */
function toParts(shares: Share[], colorOf: (share: Share, index: number) => string): Part[] {
  const sorted = [...shares].sort((a, b) => b.fraction - a.fraction);
  const kept = sorted.filter((share, i) => i < MAX_CATEGORIES || share.mine);
  const whole = Math.max(1, shares.reduce((sum, share) => sum + share.fraction, 0));
  let others = 0;
  const parts = kept.map((share) => ({
    ...share,
    part: share.fraction / whole,
    color: colorOf(share, share.mine ? 0 : others++),
  }));
  const rest = 1 - parts.reduce((sum, part) => sum + part.part, 0);
  if (rest < 0.005) return parts;
  return [
    ...parts,
    {
      label: "Other answers and smaller groups",
      fraction: rest,
      percent: Math.round(rest * 100),
      mine: false,
      part: rest,
      color: REST_COLOR,
    },
  ];
}

const categoryColor = (share: Share, index: number) => (share.mine ? MINE_COLOR : CATEGORY_COLORS[index]);

function Reveal({ className, stagger = 0.06, children }: { className?: string; stagger?: number; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true }}
      transition={{ staggerChildren: stagger }}
    >
      {children}
    </motion.div>
  );
}

function Name({ share }: { share: Pick<Share, "label" | "mine"> }) {
  return (
    <>
      {share.label}
      {share.mine ? <span className="text-accent"> · You</span> : null}
    </>
  );
}

function Legend({ parts }: { parts: Part[] }) {
  return (
    <ul className="min-w-0 flex-1 text-sm">
      {parts.map((part) => (
        <li
          key={part.label}
          className={`flex items-baseline gap-2.5 border-t border-rule py-2 first:border-t-0 ${part.mine ? "font-semibold" : ""}`}
        >
          <span aria-hidden className="size-2.5 shrink-0 translate-y-px rounded-sm" style={{ background: part.color }} />
          <span className="min-w-0 flex-1">
            <Name share={part} />
          </span>
          <span className="tabular-nums">{part.percent}%</span>
        </li>
      ))}
    </ul>
  );
}

/** Tone runs from negative to positive, so one stacked bar keeps that order visible. */
export function ToneStack({ shares }: { shares: Share[] }) {
  const parts = toParts(shares, (share) => TONE_COLORS[share.label]).sort((a, b) => {
    const order = Object.keys(TONE_COLORS);
    const position = (part: Part) => (part.color === REST_COLOR ? order.length : order.indexOf(part.label));
    return position(a) - position(b);
  });
  return (
    <div className="mt-5">
      <Reveal className="flex h-9 gap-0.5" stagger={0.1}>
        {parts.map((part) => (
          <motion.div
            key={part.label}
            className="h-full first:rounded-l last:rounded-r"
            style={{ width: `${part.part * 100}%`, background: part.color, originX: 0 }}
            variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.45, ease: "easeOut" } } }}
          />
        ))}
      </Reveal>
      <div className="mt-3">
        <Legend parts={parts} />
      </div>
    </div>
  );
}

/** People could pick several feelings, so these are ranked bars rather than parts of a whole. */
export function RankedBars({ shares }: { shares: Share[] }) {
  const ranked = [...shares].sort((a, b) => b.fraction - a.fraction);
  return (
    <Reveal className="mt-5 space-y-3 text-sm">
      {ranked.map((share) => (
        <div key={share.label} className={share.mine ? "font-semibold" : ""}>
          <div className="flex items-baseline justify-between gap-4">
            <span>
              <Name share={share} />
            </span>
            <span className="tabular-nums">{share.percent}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-rule/60">
            <motion.div
              className={`h-full rounded-full ${share.mine ? "bg-accent" : "bg-navy-soft/60"}`}
              style={{ width: `${share.percent}%`, originX: 0 }}
              variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.6, ease: "easeOut" } } }}
            />
          </div>
        </div>
      ))}
    </Reveal>
  );
}

/** Frequency is an ordered scale, so columns stay in scale order from most to least often. */
export function ScaleColumns({ shares }: { shares: Share[] }) {
  const tallest = Math.max(...shares.map((share) => share.fraction), 0.01);
  return (
    <Reveal className="mt-5" stagger={0.07}>
      <div className="grid gap-1.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${shares.length}, minmax(0, 1fr))` }}>
        {shares.map((share) => (
          <div key={share.label} className={`flex min-w-0 flex-col ${share.mine ? "font-semibold" : ""}`}>
            <div className="flex h-44 flex-col justify-end border-b border-ink-soft/40">
              <p className="pb-1 text-center text-sm tabular-nums">{share.percent}%</p>
              <motion.div
                className={`rounded-t ${share.mine ? "bg-accent" : "bg-navy-soft/60"}`}
                style={{ height: `${(share.fraction / tallest) * 78}%`, originY: 1 }}
                variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1, transition: { duration: 0.55, ease: "easeOut" } } }}
              />
            </div>
            <p className="mt-2 text-center text-xs leading-snug [overflow-wrap:anywhere]">
              <Name share={share} />
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

const point = (degrees: number, radius: number) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return `${50 + radius * Math.cos(radians)} ${50 + radius * Math.sin(radians)}`;
};

/** One tool per person, so the slices are parts of a whole. */
export function ShareDonut({ shares, respondents }: { shares: Share[]; respondents: number }) {
  const reduced = useReducedMotion();
  const parts = toParts(shares, categoryColor);
  const radius = 38;
  const gap = 1;
  const slices = parts.map((part, i) => {
    const start = parts.slice(0, i).reduce((sum, earlier) => sum + earlier.part, 0) * 360;
    return { part, start: start + gap, end: start + part.part * 360 - gap };
  });
  return (
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative size-48 shrink-0">
        <motion.svg
          viewBox="0 0 100 100"
          className="size-full"
          initial={reduced ? false : "hidden"}
          whileInView="shown"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
        >
          {slices.map(({ part, start, end }) => (
            <motion.path
              key={part.label}
              d={`M ${point(start, radius)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${point(end, radius)}`}
              fill="none"
              stroke={part.color}
              strokeWidth={13}
              variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1, transition: { duration: 0.45, ease: "easeOut" } } }}
            />
          ))}
        </motion.svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-serif text-3xl leading-none">~{respondents}</p>
          <p className="mt-1 text-xs text-muted">people</p>
        </div>
      </div>
      <div className="w-full min-w-0 flex-1">
        <Legend parts={parts} />
      </div>
    </div>
  );
}

/** A grid of 100 squares shows these shares as people, using the largest-remainder method so it always fills. */
export function PeopleWaffle({ shares }: { shares: Share[] }) {
  const parts = toParts(shares, categoryColor);
  const counts = parts.map((part) => Math.floor(part.part * 100));
  const order = parts
    .map((part, i) => ({ i, remainder: part.part * 100 - counts[i] }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let left = 100 - counts.reduce((sum, n) => sum + n, 0), k = 0; left > 0; left--, k++) {
    counts[order[k % order.length].i]++;
  }
  const cells = parts.flatMap((part, i) => Array.from({ length: counts[i] }, () => part.color));
  return (
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="shrink-0">
        <motion.svg
          viewBox="0 0 100 100"
          className="size-48"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.008 }}
        >
          {cells.map((color, i) => (
            <motion.rect
              key={i}
              x={(i % 10) * 10 + 0.5}
              y={Math.floor(i / 10) * 10 + 0.5}
              width={9}
              height={9}
              rx={1.5}
              fill={color}
              variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.2 } } }}
            />
          ))}
        </motion.svg>
        <p className="mt-2 text-center text-xs text-muted">Each square is about 1 in 100 people</p>
      </div>
      <div className="w-full min-w-0 flex-1">
        <Legend parts={parts} />
      </div>
    </div>
  );
}
