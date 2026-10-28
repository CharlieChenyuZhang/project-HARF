"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client, fetchCurrentWeeklyQuestion, listAll, type Excerpt, type WeeklyQuestion } from "@/lib/amplify";
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
    <section className="bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:py-20 md:grid-cols-[1fr_2fr] md:gap-16">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-paper/60">The Question of the Week</p>
          {question?.weekOf ? (
            <p className="mt-2 text-sm text-paper/60">
              Week of{" "}
              {new Date(`${question.weekOf}T12:00:00Z`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <div className="min-h-40">
          {question === undefined ? (
            <div className="h-24 animate-pulse rounded bg-paper/10" />
          ) : (
            <>
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{question.question}</h2>
              {question.introduction ? <p className="mt-4 max-w-xl text-paper/70">{question.introduction}</p> : null}
              <Link
                href={`/share/?weekly=${question.id}`}
                className="mt-8 inline-flex items-center gap-2 border-b border-paper/60 pb-1 text-sm uppercase tracking-[0.14em] hover:border-paper"
              >
                Respond to this question <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>
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
      <div className="grid gap-10 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 animate-pulse border-t border-rule bg-paper-deep/40" />
        ))}
      </div>
    );
  if (!excerpts.length) return <p className="text-muted">The first testimonies are being reviewed.</p>;

  return (
    <div className="grid gap-12 md:grid-cols-3 md:gap-10">
      {excerpts.map((e) => (
        <ExcerptCard key={e.id} excerpt={e} />
      ))}
    </div>
  );
}
