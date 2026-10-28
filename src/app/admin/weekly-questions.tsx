"use client";

import { useCallback, useEffect, useState } from "react";
import { client, errorMessage, listAll, type WeeklyQuestion } from "@/lib/amplify";
import { Badge, Notice, inputClass, primaryButton, secondaryButton } from "./ui";

const auth = { authMode: "userPool" } as const;

function nextMonday() {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

async function fetchQuestions() {
  const all = await listAll((nextToken) => client.models.WeeklyQuestion.list({ ...auth, nextToken }));
  return all.sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export function WeeklyQuestions() {
  const [items, setItems] = useState<WeeklyQuestion[] | null>(null);
  const [question, setQuestion] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [weekOf, setWeekOf] = useState(nextMonday);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => fetchQuestions().then(setItems), []);

  useEffect(() => {
    fetchQuestions()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  // The public site shows the most recent active question, so activating one
  // deactivates the others.
  async function activate(target: WeeklyQuestion | null) {
    for (const q of items ?? []) {
      const active = q.id === target?.id;
      if (q.active !== active) await client.models.WeeklyQuestion.update({ id: q.id, active }, auth);
    }
  }

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const { data, errors } = await client.models.WeeklyQuestion.create(
        { question: question.trim(), introduction: introduction.trim() || null, weekOf, active: false },
        auth,
      );
      if (!data) throw new Error(errorMessage(errors, "Could not create the question."));
      await activate(data);
      await client.models.WeeklyQuestion.update({ id: data.id, active: true }, auth);
      setQuestion("");
      setIntroduction("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the question.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(q: WeeklyQuestion) {
    setBusy(true);
    try {
      await activate(q.active ? null : q);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
      <section>
        <p className="eyebrow">New question</p>
        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Question</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Have you ever pretended not to use AI? Why?"
              className={`${inputClass} font-serif text-lg`}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Short introduction (optional)</span>
            <textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} rows={2} className={inputClass} />
          </label>
          <label className="block max-w-xs text-sm">
            <span className="mb-1.5 block font-medium">Week of</span>
            <input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} className={inputClass} />
          </label>
          {error ? <Notice kind="error">{error}</Notice> : null}
          <button type="button" onClick={create} disabled={busy || !question.trim()} className={primaryButton}>
            Publish as this week&apos;s question
          </button>
        </div>
      </section>

      <section>
        <p className="eyebrow">All questions</p>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          {(items ?? []).map((q) => (
            <li key={q.id} className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-serif text-lg leading-snug">{q.question}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                  Week of {q.weekOf} {q.active ? <Badge tone="ok">On the site</Badge> : null}
                </p>
              </div>
              <button type="button" onClick={() => toggle(q)} disabled={busy} className={secondaryButton}>
                {q.active ? "Retire" : "Make current"}
              </button>
            </li>
          ))}
          {items && !items.length ? <li className="py-4 text-sm text-muted">No questions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
