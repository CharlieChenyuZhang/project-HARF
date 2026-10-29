"use client";

import { useEffect, useMemo, useState } from "react";
import { client, listAll } from "@/lib/amplify";
import type { Schema } from "../../../amplify/data/resource";
import { Notice } from "./ui";

const auth = { authMode: "userPool" } as const;
type Event = Schema["AnalyticsEvent"]["type"];

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "All time", days: 0 },
] as const;

type Row = [label: string, value: string | number];

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

function summarize(events: Event[]): Record<"traffic" | "sources" | "stories" | "surveys" | "engagement", Row[]> {
  const count = (name: string, from?: string) =>
    events.filter((e) => e.name === name && (from === undefined || e.from === from)).length;
  const views = events.filter((e) => e.name === "page_view");

  const daysByVisitor = new Map<string, Set<string>>();
  for (const v of views) {
    if (!v.visitorId) continue;
    const days = daysByVisitor.get(v.visitorId) ?? new Set<string>();
    days.add(v.createdAt.slice(0, 10));
    daysByVisitor.set(v.visitorId, days);
  }
  const deviceOf = new Map(views.map((v) => [v.visitorId, v.device]));
  const mobile = [...deviceOf.values()].filter((d) => d === "mobile").length;

  const sources = new Map<string, number>();
  for (const v of views)
    sources.set(v.referrer || "Direct or unknown", (sources.get(v.referrer || "Direct or unknown") ?? 0) + 1);

  const storyStarts = count("story_start");
  const storySubmits = count("story_submit");
  const surveyStarts = count("survey_start");
  const surveySubmits = count("survey_submit");

  return {
    traffic: [
      ["Visitors", daysByVisitor.size],
      ["Returning visitors (seen on 2+ days)", [...daysByVisitor.values()].filter((d) => d.size > 1).length],
      ["Page views", views.length],
      ["Mobile / desktop visitors", `${mobile} / ${deviceOf.size - mobile}`],
    ],
    sources: [...sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    stories: [
      ["Clicks on Share your experience", count("share_click")],
      ["Story forms started", storyStarts],
      ["Stories completed", storySubmits],
      [
        "Abandoned before submitting",
        `${Math.max(0, storyStarts - storySubmits)} (${pct(Math.max(0, storyStarts - storySubmits), storyStarts)})`,
      ],
    ],
    surveys: [
      ["Clicks on Take the survey", count("survey_click")],
      ["Survey opened", count("survey_view")],
      ["Surveys started", surveyStarts],
      ["Surveys completed", surveySubmits],
      [
        "Abandoned before submitting",
        `${Math.max(0, surveyStarts - surveySubmits)} (${pct(Math.max(0, surveyStarts - surveySubmits), surveyStarts)})`,
      ],
    ],
    engagement: [
      ["Archive visits", views.filter((v) => v.path?.startsWith("/archive")).length],
      ["Question of the Week clicks", count("qotw_click")],
      ["Question of the Week responses", count("story_submit", "weekly")],
      [
        "Six-month opt-ins (story / survey)",
        `${count("followup_optin", "story")} / ${count("followup_optin", "survey")}`,
      ],
    ],
  };
}

/** A plain summary of anonymous usage events. Whether stories are meaningful is an editorial call. */
export function AnalyticsPanel() {
  const [days, setDays] = useState<number>(30);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const since = days ? new Date(Date.now() - days * 86400_000).toISOString() : undefined;
    listAll((nextToken) =>
      client.models.AnalyticsEvent.list({
        ...auth,
        nextToken,
        limit: 1000,
        filter: since ? { createdAt: { gt: since } } : undefined,
      }),
    )
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load analytics."));
  }, [days]);

  const summary = useMemo(() => (events ? summarize(events) : null), [events]);

  if (error) return <Notice kind="error">{error}</Notice>;

  return (
    <div className="space-y-8">
      <div className="flex gap-2 text-xs">
        {RANGES.map((r) => (
          <button
            key={r.label}
            type="button"
            aria-pressed={days === r.days}
            onClick={() => {
              setEvents(null);
              setDays(r.days);
            }}
            className={`rounded-full border px-3 py-1.5 ${days === r.days ? "border-ink bg-ink text-paper" : "border-rule bg-card hover:border-ink"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {!summary ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Table title="Traffic" rows={summary.traffic} />
          <Table
            title="Top sources (page views)"
            rows={summary.sources.length ? summary.sources : [["No visits yet", ""] as Row]}
          />
          <Table title="Personal stories" rows={summary.stories} />
          <Table title="Structured survey (Tally)" rows={summary.surveys} />
          <Table title="Engagement" rows={summary.engagement} />
        </div>
      )}
      <p className="text-xs text-muted">
        Anonymous counts from this site only. Visitors who block tracking aren&apos;t counted, and survey numbers cover
        the embedded form, not responses opened directly on Tally.
      </p>
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="rounded-lg bg-card p-5 ring-1 ring-rule">
      <h3 className="font-serif text-xl">{title}</h3>
      <dl className="mt-3 divide-y divide-rule text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-2">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
