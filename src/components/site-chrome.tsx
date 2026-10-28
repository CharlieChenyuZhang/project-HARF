import Link from "next/link";

export const SURVEY_URL = "https://tally.so/r/RWKrVl";

const PREVIEW = process.env.NEXT_PUBLIC_HARF_PREVIEW !== "false";

export function PreviewBanner() {
  if (!PREVIEW) return null;
  return (
    <div className="bg-ink text-paper">
      <p className="mx-auto max-w-6xl px-5 py-2 text-center text-[0.78rem] leading-snug tracking-wide">
        Private testing environment. The archive shows fictional sample entries. Please don&apos;t submit real
        testimonies yet.
      </p>
    </div>
  );
}

const NAV = [
  { href: "/share/", label: "Share" },
  { href: "/archive/", label: "Archive" },
  { href: "/survey/", label: "Survey" },
  { href: "/about/", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-2xl font-semibold tracking-[0.12em]">HARF</span>
          <span className="hidden text-[0.72rem] uppercase tracking-[0.16em] text-muted sm:inline">
            Human Agency, Reasoning &amp; Futures
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-sm sm:gap-7">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink-soft transition-colors hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl">A story captures the event. Living Memory preserves the transformation.</p>
          <p className="mt-4 max-w-md text-sm text-muted">
            HARF is an independent initiative documenting the human experience of artificial intelligence, beginning
            with students, educators and researchers in Boston.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Participate</p>
          <Link className="block hover:text-accent" href="/share/">Share your experience</Link>
          <Link className="block hover:text-accent" href="/survey/">Take the survey</Link>
          <Link className="block hover:text-accent" href="/archive/">Explore the archive</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Project</p>
          <Link className="block hover:text-accent" href="/about/">About HARF</Link>
          <Link className="block hover:text-accent" href="/privacy/">Privacy &amp; consent</Link>
          <Link className="block hover:text-accent" href="/admin/">Editors</Link>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-10 text-xs text-muted">© {new Date().getFullYear()} HARF</p>
    </footer>
  );
}
