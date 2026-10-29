import Link from "next/link";
import { Monogram } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const SURVEY_URL = "https://tally.so/r/RWKrVl";

// Opt-in testing banner: build with NEXT_PUBLIC_HARF_PREVIEW=true to show it.
const PREVIEW = process.env.NEXT_PUBLIC_HARF_PREVIEW === "true";

export const NAV = [
  { href: "/share/", label: "Share" },
  { href: "/archive/", label: "Archive" },
  { href: "/survey/", label: "Survey" },
  { href: "/about/", label: "About" },
];

export function PreviewBanner() {
  if (!PREVIEW) return null;
  return (
    <div className="bg-accent text-card">
      <p className="mx-auto max-w-6xl px-5 py-1.5 text-center text-xs">
        Testing preview · fictional sample entries only
      </p>
    </div>
  );
}

/** `accent` recolors the monogram's rule, e.g. a lighter crimson on navy. */
export function Wordmark({ className = "", accent }: { className?: string; accent?: string }) {
  return (
    <span
      className={`flex items-center gap-3 ${className}`}
      style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}
    >
      <Monogram className="h-11 w-auto" />
      <span className="hidden text-[0.62rem] uppercase leading-snug tracking-[0.2em] opacity-75 sm:block">
        Human Agency,
        <br />
        Reasoning &amp; Futures
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="HARF home" className="py-1">
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-soft transition-colors hover:text-accent">
              {item.label}
            </Link>
          ))}
          <Link
            href="/share/"
            className="rounded-full bg-accent px-4 py-2 text-card transition-colors hover:bg-ink"
          >
            Share your story
          </Link>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Wordmark accent="#e8909d" />
          <p className="mt-6 max-w-sm font-serif text-xl leading-snug text-card/90">
            A story captures the event. Living Memory preserves the transformation.
          </p>
        </div>
        <div className="text-sm text-card/75 [&_a]:block [&_a]:py-1.5">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-card/50">Participate</p>
          <Link className="block hover:text-card" href="/share/">Share your story</Link>
          <a className="block hover:text-card" href={SURVEY_URL} target="_blank" rel="noopener noreferrer">Take the survey</a>
          <Link className="block hover:text-card" href="/archive/">Explore the archive</Link>
        </div>
        <div className="text-sm text-card/75 [&_a]:block [&_a]:py-1.5">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-card/50">Project</p>
          <Link className="block hover:text-card" href="/about/">About</Link>
          <Link className="block hover:text-card" href="/privacy/">Privacy &amp; consent</Link>
          <Link className="block hover:text-card" href="/admin/">Editors</Link>
        </div>
      </div>
      <p className="mx-auto max-w-6xl border-t border-card/10 px-5 py-6 text-xs text-card/50">
        © {new Date().getFullYear()} HARF · An independent initiative, starting in Boston
      </p>
    </footer>
  );
}
