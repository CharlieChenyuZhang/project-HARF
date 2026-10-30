import { ArrowRight, ClipboardList, Clock, Library, PenLine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HERO_PHOTO_CREDIT, HeroPhoto } from "@/components/hero-photo";
import { ArchivePreview, WeeklyQuestionCard } from "@/components/home-islands";
import { ThemeIcon } from "@/components/icons";
import { THEMES } from "@/lib/harf";

const ACTIONS: { href: string; icon: LucideIcon; title: string; text: string; time: string; track: string }[] = [
  {
    href: "/share/",
    icon: PenLine,
    title: "Share your experience",
    text: "Tell your story in your own words.",
    time: "About 5–10 min",
    track: "share_click",
  },
  {
    href: "/survey/",
    icon: ClipboardList,
    title: "Take the survey",
    text: "Answer structured questions about your experience.",
    time: "About 5–7 min",
    track: "survey_click",
  },
  {
    href: "/archive/",
    icon: Library,
    title: "Explore the archive",
    text: "Discover how others are experiencing the AI transition.",
    time: "Browse at your own pace",
    track: "archive_click",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-card">
        <HeroPhoto />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-28">
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] sm:text-7xl md:text-8xl">
            A Living Memory of the AI Transition
          </h1>
          <p className="mt-8 max-w-2xl font-serif text-2xl leading-snug text-card/90 sm:text-3xl">
            We are experiencing a transformation we do not yet fully understand.
          </p>
          <p className="mt-5 max-w-xl text-lg text-card/75">How is AI changing the way you think, learn, work, and feel?</p>
        </div>
        <a
          href={HERO_PHOTO_CREDIT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-5 hidden text-[0.65rem] text-card/50 hover:text-card sm:block"
        >
          Photo: {HERO_PHOTO_CREDIT.name} / Unsplash
        </a>
      </section>

      {/* Invitation to participate */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Tell us what AI is changing in your life.</h2>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Your experience today could help us understand what changed tomorrow.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ACTIONS.map(({ href, icon: Icon, title, text, time, track }) => (
            <Link
              key={title}
              href={href}
              data-track={track}
              data-track-from="home_card"
              className="group relative flex flex-col rounded-lg bg-card p-7 shadow-sm ring-1 ring-rule transition-shadow hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon aria-hidden className="size-6" strokeWidth={1.6} />
              </span>
              <span className="mt-6 block font-serif text-2xl">{title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{text}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 pt-1 text-xs text-muted">
                <Clock aria-hidden className="size-3.5" />
                {time}
              </span>
              <ArrowRight
                aria-hidden
                className="absolute right-6 top-6 size-5 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          ))}
        </div>
      </section>

      <WeeklyQuestionCard />

      {/* Purpose */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
        <p className="mx-auto max-w-3xl font-serif text-2xl italic leading-snug text-gold sm:text-3xl">
          Documenting how artificial intelligence is reshaping the way we think, learn, work, and relate to one another
          — as the transformation unfolds.
        </p>
        <span aria-hidden className="mx-auto my-12 block h-0.5 w-24 bg-gold" />
        <blockquote className="font-serif text-3xl leading-tight sm:text-5xl">
          “What people believed before they knew what happened cannot be reconstructed later.”
        </blockquote>
      </section>

      {/* Themes */}
      <section className="mx-auto max-w-6xl px-5">
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

      {/* Hand-picked excerpts; the section hides itself until there are some. */}
      <ArchivePreview />
    </>
  );
}
