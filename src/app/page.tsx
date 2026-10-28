import Link from "next/link";
import { ArchivePreview, WeeklyQuestionCard } from "@/components/home-islands";
import { SURVEY_URL } from "@/components/site-chrome";
import { THEMES } from "@/lib/harf";

const CONTRADICTIONS = [
  "More productive, yet less intellectually confident.",
  "Discovering new creative possibilities while growing more dependent.",
  "Using AI constantly while feeling uncomfortable admitting it.",
  "Learning differently without knowing whether it is more, or less.",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
        <p className="eyebrow">A Living Memory of the AI transition</p>
        <h1 className="mt-6 max-w-4xl font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          We are living through a transformation we do not yet fully understand.
        </h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[3fr_2fr] md:gap-16">
          <div>
            <p className="font-serif text-2xl italic leading-snug text-ink-soft sm:text-3xl">
              How is AI changing the way you think, learn, work, and feel?
            </p>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
              HARF is an independent initiative documenting the human experience of artificial intelligence. Through
              personal testimonies, research, and recurring observations, we are building a living record of how people
              adapt to one of the most consequential technological transformations in history.
            </p>
          </div>
          <nav aria-label="Participate" className="flex flex-col self-end border-t border-ink">
            <Link
              href="/share/"
              className="group flex items-center justify-between border-b border-rule py-5 transition-colors hover:text-accent"
            >
              <span>
                <span className="block text-sm uppercase tracking-[0.16em]">Share your experience</span>
                <span className="mt-1 block text-sm text-muted">Tell us something in your own words</span>
              </span>
              <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={SURVEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border-b border-rule py-5 transition-colors hover:text-accent"
            >
              <span>
                <span className="block text-sm uppercase tracking-[0.16em]">Take the survey</span>
                <span className="mt-1 block text-sm text-muted">A structured questionnaire for the research</span>
              </span>
              <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">↗</span>
            </a>
            <Link
              href="/archive/"
              className="group flex items-center justify-between border-b border-rule py-5 transition-colors hover:text-accent"
            >
              <span>
                <span className="block text-sm uppercase tracking-[0.16em]">Explore the archive</span>
                <span className="mt-1 block text-sm text-muted">Selected testimonies, shared with consent</span>
              </span>
              <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </nav>
        </div>
      </section>

      {/* Principle */}
      <section className="border-y border-rule bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="eyebrow">Why now</p>
          <blockquote className="mt-6 max-w-4xl font-serif text-3xl leading-tight sm:text-5xl">
            What people believed before they knew what happened cannot be reconstructed later.
          </blockquote>
          <p className="mt-8 max-w-2xl leading-relaxed text-ink-soft">
            We can interview people about the AI revolution ten years from now. But we will never be able to recreate
            exactly what they thought, feared, expected, or misunderstood in 2026. HARF preserves those perceptions
            while the transformation is still unfolding — including the uncertainty, the contradictions, and the
            interpretations that will later be abandoned.
          </p>
        </div>
      </section>

      <WeeklyQuestionCard />

      {/* Where we start */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="eyebrow">Where we start</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">Students and the academic community</h2>
            <p className="mt-6 leading-relaxed text-ink-soft">
              We begin with students, educators and researchers in Boston, where some of the most revealing
              contradictions of this transition are already visible. HARF does not assume AI is making people better or
              worse. Our task is to document what is happening.
            </p>
          </div>
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {CONTRADICTIONS.map((c, i) => (
              <li key={c} className="border-t border-rule pt-4">
                <span className="font-serif text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-serif text-xl leading-snug">{c}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Two channels */}
      <section className="border-y border-rule bg-paper-deep/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:gap-16">
          <div>
            <p className="eyebrow">Open testimonies</p>
            <p className="mt-4 font-serif text-2xl leading-snug">
              The Living Memory captures what people spontaneously want to tell us.
            </p>
            <p className="mt-4 text-ink-soft">
              Personal narratives, in your own words. Some of the most valuable insights come from experiences we
              haven&apos;t thought to ask about.
            </p>
            <Link href="/share/" className="mt-6 inline-block border-b border-ink pb-0.5 text-sm hover:text-accent">
              Share your experience →
            </Link>
          </div>
          <div>
            <p className="eyebrow">Structured research</p>
            <p className="mt-4 font-serif text-2xl leading-snug">The survey captures what we know to ask.</p>
            <p className="mt-4 text-ink-soft">
              A questionnaire within the Boston academic community exploring AI&apos;s effects on thinking, learning and
              intellectual autonomy, so we can identify patterns and compare responses.
            </p>
            <Link href="/survey/" className="mt-6 inline-block border-b border-ink pb-0.5 text-sm hover:text-accent">
              Take the survey →
            </Link>
          </div>
        </div>
      </section>

      {/* From the archive */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">From the archive</p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Selected testimonies</h2>
          </div>
          <Link href="/archive/" className="border-b border-ink pb-0.5 text-sm hover:text-accent">
            Explore the archive →
          </Link>
        </div>
        <ArchivePreview />
        <ul className="mt-16 flex flex-wrap gap-x-3 gap-y-2 font-serif text-lg text-muted">
          {THEMES.map((t, i) => (
            <li key={t}>
              <Link href={`/archive/?theme=${encodeURIComponent(t)}`} className="hover:text-accent">
                {t}
              </Link>
              {i < THEMES.length - 1 ? <span aria-hidden className="ml-3">·</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
