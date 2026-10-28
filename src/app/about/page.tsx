import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why HARF is building a Living Memory of the human experience of AI.",
};

const QUESTIONS = [
  "What did students believe AI would do to their intelligence in 2026?",
  "Which fears disappeared?",
  "Which unexpected changes became permanent?",
  "How did people redefine authorship, competence, creativity and responsibility?",
  "What did society normalize without realizing it?",
];

const MOMENTS = [
  "A student stops trusting their own writing.",
  "A professor changes the way assignments are evaluated.",
  "A professional begins relying on AI-generated recommendations without noticing how their decision-making has changed.",
  "Someone discovers a creative ability they never knew they had.",
];

export default function AboutPage() {
  return (
    <div className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">About HARF</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">HARF begins where the headline ends.</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
          <p className="text-lg leading-relaxed text-ink-soft">
            Most attention goes to what AI systems can do, how quickly they improve, and what disruption they might
            cause. HARF — Human Agency, Reasoning &amp; Futures — asks a different question: what happens to the human
            experience while all of this is happening?
          </p>
          <p className="text-lg leading-relaxed text-ink-soft">
            We are interested in the space between technological capability and lived reality, and particularly in the
            small, everyday changes that rarely become news. Collectively, they may tell us something fundamental about
            the transformation of human agency.
          </p>
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <ul className="grid gap-x-10 gap-y-8 border-t border-ink pt-8 sm:grid-cols-2">
          {MOMENTS.map((m) => (
            <li key={m} className="font-serif text-2xl leading-snug">{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-24 border-y border-rule bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="eyebrow">A Living Memory</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight">A story captures the event. Living Memory preserves the transformation.</h2>
          </div>
          <div className="space-y-5 leading-relaxed text-ink-soft">
            <p>
              Participants can return months later to describe how their experience has changed. Someone may write in
              October that AI is making them less confident in their own writing — and return in February to say
              they have learned to use it differently and feel more confident than before. We preserve both moments.
              The evolution is as important as the testimony itself.
            </p>
            <p>
              Every technological revolution leaves behind an archive of its machines. Very few leave behind a
              systematic record of how people experienced the transformation of their own intelligence. HARF wants to
              become that record.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Imagine a researcher in 2035 asking</p>
        <ul className="mt-8 space-y-5">
          {QUESTIONS.map((q) => (
            <li key={q} className="border-b border-rule pb-5 font-serif text-2xl leading-snug sm:text-3xl">{q}</li>
          ))}
        </ul>
        <p className="mt-10 max-w-2xl leading-relaxed text-ink-soft">
          The most valuable part of the archive may be precisely what people initially misunderstood, because
          retrospective accounts tend to reinterpret the past in light of what eventually happened.
        </p>
        <div className="mt-12 flex flex-wrap gap-6 text-sm">
          <Link href="/share/" className="border-b border-ink pb-0.5 hover:text-accent">Share your experience →</Link>
          <Link href="/privacy/" className="border-b border-ink pb-0.5 hover:text-accent">Privacy &amp; consent →</Link>
        </div>
      </section>
    </div>
  );
}
