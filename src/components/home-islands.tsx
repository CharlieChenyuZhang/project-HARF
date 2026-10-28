"use client";

import { MessageCircleQuestionMark } from "lucide-react";
import { useEffect, useState } from "react";
import { client, fetchCurrentWeeklyQuestion, listAll, type Excerpt, type WeeklyQuestion } from "@/lib/amplify";
import { CircleLink } from "./circle-link";
import { ExcerptCard } from "./excerpt-card";

export function WeeklyQuestionCard() {
  const [question, setQuestion] = useState<WeeklyQuestion | null | undefined>(undefined);

  useEffect(() => {
    fetchCurrentWeeklyQuestion()
      .then(setQuestion)
      .catch(() => setQuestion(null));
  }, []);

  if (question === null) return null;

  return (
    <section className="mx-auto max-w-6xl px-5">
      <div className="grid items-center gap-8 rounded-lg bg-card p-8 shadow-sm ring-1 ring-rule sm:p-12 md:grid-cols-[auto_1fr_auto]">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <MessageCircleQuestionMark aria-hidden className="size-8" strokeWidth={1.5} />
        </span>
        <div>
          <p className="eyebrow">Question of the week</p>
          {question === undefined ? (
            <div className="mt-3 h-10 max-w-xl animate-pulse rounded bg-paper-deep" />
          ) : (
            <h2 className="mt-2 font-serif text-2xl leading-snug sm:text-3xl">{question.question}</h2>
          )}
        </div>
        {question ? <CircleLink href={`/share/?weekly=${question.id}`}>Respond</CircleLink> : null}
      </div>
    </section>
  );
}

export function ArchivePreview() {
  const [excerpts, setExcerpts] = useState<Excerpt[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listAll((nextToken) => client.models.Excerpt.list({ nextToken }))
      .then((items) => setExcerpts(items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="text-muted">The archive is unavailable right now.</p>;
  if (!excerpts)
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-card" />
        ))}
      </div>
    );
  if (!excerpts.length) return <p className="text-muted">The first stories are being reviewed.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {excerpts.map((e) => (
        <ExcerptCard key={e.id} excerpt={e} />
      ))}
    </div>
  );
}
