import { ArrowRight, ArrowUpRight, ClipboardList, Library, PenLine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { CircleLink } from "@/components/circle-link";
import { HERO_PHOTO_CREDIT, HeroPhoto } from "@/components/hero-photo";
import { ArchivePreview, WeeklyQuestionCard } from "@/components/home-islands";
import { ThemeIcon } from "@/components/icons";
import { SURVEY_URL } from "@/components/site-chrome";
import { THEMES } from "@/lib/harf";

const ACTIONS: { href: string; icon: LucideIcon; title: string; text: string; external?: boolean }[] = [
  { href: "/share/", icon: PenLine, title: "Share your experience", text: "In your own words." },
  { href: SURVEY_URL, icon: ClipboardList, title: "Take the survey", text: "Structured questions.", external: true },
  { href: "/archive/", icon: Library, title: "Explore the archive", text: "Stories shared with consent." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-card">
        <HeroPhoto />
        <div className="relative mx-auto max-w-6xl px-5 pb-32 pt-16 sm:pb-40 sm:pt-28">
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] sm:text-7xl md:text-8xl">
            A Living Memory of the AI transition
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-2xl leading-snug text-card/90 sm:text-3xl">
            We are experiencing a transformation we do not yet fully understand.
          </p>
          <p className="mt-5 max-w-xl text-lg text-card/70">How is AI changing the way you think, learn, work, and feel?</p>
          <div className="mt-10">
            <CircleLink href="/share/" tone="light">
              Share your story
            </CircleLink>
          </div>
        </div>
        <a
          href={HERO_PHOTO_CREDIT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-24 right-5 hidden text-[0.65rem] text-card/50 hover:text-card sm:block"
        >
          Photo: {HERO_PHOTO_CREDIT.name} / Unsplash
        </a>
      </section>

      {/* Three actions */}
      <section className="relative mx-auto -mt-20 max-w-6xl px-5">
        <div className="grid gap-4 md:grid-cols-3">
          {ACTIONS.map(({ href, icon: Icon, title, text, external }) => {
            const body = (
              <>
                <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-6" strokeWidth={1.6} />
                </span>
                <span className="mt-6 block font-serif text-2xl">{title}</span>
                <span className="mt-1 block text-sm text-muted">{text}</span>
                {external ? (
                  <ArrowUpRight aria-hidden className="absolute right-6 top-6 size-5 text-muted transition-colors group-hover:text-accent" />
                ) : (
                  <ArrowRight aria-hidden className="absolute right-6 top-6 size-5 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                )}
              </>
            );
            const className =
              "group relative block rounded-lg bg-card p-7 shadow-sm ring-1 ring-rule transition-shadow hover:shadow-md";
            return external ? (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {body}
              </a>
            ) : (
              <Link key={title} href={href} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Founding inquiry */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:pt-32">
        <div className="max-w-3xl">
          <p className="font-serif text-2xl italic leading-snug text-gold sm:text-3xl">
            A founding inquiry into how human capacities — and the signals by which we recognize them — change under
            continuous machine mediation.
          </p>
          <p className="mt-8 font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
            Documenting how artificial intelligence is changing human capacities and the signals through which we
            recognize thought, authorship, understanding, contribution, judgement, and responsibility.
          </p>
          <p className="mt-8 font-serif text-lg font-semibold leading-snug sm:text-xl">
            The founding year begins a longitudinal record of that transition: Living Memory
          </p>
          <span aria-hidden className="mt-8 block h-0.5 w-24 bg-gold" />
        </div>
      </section>

      {/* Principle */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
        <blockquote className="font-serif text-3xl leading-tight sm:text-5xl">
          “What people believed before they knew what happened cannot be reconstructed later.”
        </blockquote>
        <p className="mt-6 text-sm uppercase tracking-[0.18em] text-muted">Why we start now</p>
      </section>

      <WeeklyQuestionCard />

      {/* Themes */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <h2 className="font-serif text-3xl sm:text-4xl">Explore by theme</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => (
            <li key={t}>
              <Link
                href={`/archive/?theme=${encodeURIComponent(t)}`}
                className="group flex items-center gap-3 rounded-lg bg-card px-4 py-4 ring-1 ring-rule transition-colors hover:bg-navy hover:text-card hover:ring-navy"
              >
                <ThemeIcon theme={t} className="size-5 shrink-0 text-accent group-hover:text-card" />
                <span className="text-sm font-medium sm:text-base">{t}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* From the archive */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl sm:text-4xl">From the archive</h2>
          <CircleLink href="/archive/">See all stories</CircleLink>
        </div>
        <ArchivePreview />
      </section>
    </>
  );
}
