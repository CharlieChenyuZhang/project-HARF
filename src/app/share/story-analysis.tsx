"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { client } from "@/lib/amplify";
import { COMMUNITY_DIMENSIONS, MIN_GROUP, type CommunityDimension, type CommunityRow } from "@/lib/community";
import { readTone, type Tone } from "@/lib/tone";
import type { Bar } from "./charts-3d";

const Bars3D = dynamic(() => import("./charts-3d").then((m) => m.Bars3D), { ssr: false });
const ToneScale3D = dynamic(() => import("./charts-3d").then((m) => m.ToneScale3D), {
  ssr: false,
  loading: () => <div className="h-[170px]" />,
});

export type OwnAnswers = {
  feelings: string[];
  aiUseFrequency: string;
  mainAiTool: string;
  noticedChange: string;
};

const TONE_SENTENCE: Record<Tone, string> = {
  "Mostly positive": "The words in your story lean positive.",
  "Mostly negative": "The words in your story lean negative.",
  Mixed: "Your story holds positive and negative words in similar measure.",
  Neutral: "Your story doesn't use many strongly positive or negative words.",
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** What the participant sees right after submitting. Everything except the code and thanks is optional extra. */
export function StoryAnalysis({ text, answers }: { text: string; answers: OwnAnswers }) {
  const reading = useMemo(() => readTone(text), [text]);
  const [rows, setRows] = useState<CommunityRow[] | null>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
    (async () => {
      const { data } = await client.queries.communityStats();
      setRows((data ?? []).filter((r) => r !== null) as CommunityRow[]);
    })().catch(() => setRows([]));
  }, []);

  const mine = (dimension: CommunityDimension, label: string) => {
    if (dimension === "tone") return reading?.tone === label;
    if (dimension === "feelings") return answers.feelings.includes(label);
    return answers[dimension] === label;
  };

  const charts = COMMUNITY_DIMENSIONS.map(({ key, title }) => {
    const group = (rows ?? []).filter((r) => r.dimension === key);
    const bars: Bar[] = group.map((r) => ({
      label: r.label,
      value: r.respondents ? r.count / r.respondents : 0,
      display: `${r.respondents ? Math.round((r.count / r.respondents) * 100) : 0}%`,
      mine: mine(key, r.label),
    }));
    return { key, title, bars, respondents: group[0]?.respondents ?? 0 };
  }).filter((c) => c.bars.length >= 2);

  return (
    <section aria-labelledby="analysis-title" className="mt-10 space-y-6">
      <div>
        <p className="eyebrow">Your story, read back</p>
        <h2 id="analysis-title" className="mt-3 font-serif text-3xl leading-tight">
          A first look at what you wrote
        </h2>
      </div>

      <div className="rounded-lg bg-card p-6 ring-1 ring-rule sm:p-8">
        {reading ? (
          <>
            <p className="eyebrow">Tone</p>
            <p className="mt-2 font-serif text-4xl">{reading.tone}</p>
            <p className="mt-2 text-ink-soft">{TONE_SENTENCE[reading.tone]}</p>
            {webgl ? (
              <div aria-hidden className="mt-4">
                <ToneScale3D score={reading.score} />
              </div>
            ) : null}
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <WordList title="Positive words" words={reading.positive} />
              <WordList title="Negative words" words={reading.negative} />
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              An automatic estimate from a simple English word list. It can&apos;t see irony or context, and it
              describes these words, not you or your experience.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Tone</p>
            <p className="mt-2 text-ink-soft">
              The tone reading only works in English for now, so we haven&apos;t estimated one for your story. It has
              been saved exactly as you wrote it.
            </p>
          </>
        )}
      </div>

      {rows === null ? <p className="text-sm text-muted">Loading what others have shared…</p> : null}

      {charts.map((chart) => (
        <figure key={chart.key} className="rounded-lg bg-card p-6 ring-1 ring-rule sm:p-8">
          <figcaption>
            <p className="font-serif text-2xl leading-snug">{chart.title}</p>
            <p className="mt-1 text-xs text-muted">
              Share of about {chart.respondents} people who answered
              {chart.key === "feelings" ? ". People could pick several, so these add up to more than 100%" : ""}
            </p>
          </figcaption>
          {webgl ? (
            <div aria-hidden className="mt-4">
              <Bars3D bars={chart.bars} />
            </div>
          ) : null}
          <table className={webgl ? "sr-only" : "mt-4 w-full text-sm"}>
            <tbody>
              {chart.bars.map((bar) => (
                <tr key={bar.label} className="border-t border-rule">
                  <th scope="row" className="py-2 text-left font-normal">
                    {bar.label}
                    {bar.mine ? " (you)" : ""}
                  </th>
                  <td className="py-2 text-right tabular-nums">{bar.display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      ))}

      {rows !== null ? (
        <p className="text-xs leading-relaxed text-muted">
          {charts.length
            ? `Counts are rounded to the nearest ${MIN_GROUP}, and groups smaller than ${MIN_GROUP} people aren't shown. Your own group may be missing for that reason, and your story may take a few minutes to be counted.`
            : `Charts of what others have shared appear once enough people have taken part. We never show groups smaller than ${MIN_GROUP} people.`}
        </p>
      ) : null}
    </section>
  );
}

function WordList({ title, words }: { title: string; words: string[] }) {
  const unique = [...new Set(words)];
  return (
    <div>
      <dt className="font-medium">
        {title} <span className="tabular-nums text-muted">({words.length})</span>
      </dt>
      <dd className="mt-1 text-ink-soft">{unique.length ? unique.join(", ") : "None found"}</dd>
    </div>
  );
}
