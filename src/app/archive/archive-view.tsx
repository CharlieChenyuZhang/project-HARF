"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExcerptCard } from "@/components/excerpt-card";
import { client, listAll, type Excerpt } from "@/lib/amplify";
import { THEMES } from "@/lib/harf";

export function ArchiveView() {
  const params = useSearchParams();
  const router = useRouter();
  const theme = params.get("theme");
  const [excerpts, setExcerpts] = useState<Excerpt[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listAll((nextToken) => client.models.Excerpt.list({ nextToken }))
      .then((items) => setExcerpts(items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))))
      .catch(() => setFailed(true));
  }, []);

  const visible = useMemo(
    () => (excerpts ?? []).filter((e) => !theme || e.themes?.includes(theme)),
    [excerpts, theme],
  );

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of excerpts ?? []) for (const t of e.themes ?? []) if (t) c.set(t, (c.get(t) ?? 0) + 1);
    return c;
  }, [excerpts]);

  const select = (t: string | null) => router.replace(t ? `/archive/?theme=${encodeURIComponent(t)}` : "/archive/", { scroll: false });

  return (
    <>
      <div className="sticky top-0 z-10 -mx-5 mb-12 border-y border-rule bg-paper/95 px-5 py-4 backdrop-blur">
        <ul className="flex gap-2 overflow-x-auto pb-1 text-sm">
          <li>
            <ThemeButton active={!theme} onClick={() => select(null)}>
              All
            </ThemeButton>
          </li>
          {THEMES.map((t) => (
            <li key={t}>
              <ThemeButton active={theme === t} onClick={() => select(t)}>
                {t}
                {counts.get(t) ? <span className="ml-1.5 text-xs opacity-60">{counts.get(t)}</span> : null}
              </ThemeButton>
            </li>
          ))}
        </ul>
      </div>

      {failed ? (
        <p className="text-muted">The archive is unavailable right now. Please try again later.</p>
      ) : !excerpts ? (
        <div className="grid gap-12 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse border-t border-rule bg-paper-deep/40" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {visible.map((e, i) => (
            <ExcerptCard key={e.id} excerpt={e} size={i === 0 && !theme ? "lg" : "md"} />
          ))}
        </div>
      ) : (
        <div className="border-t border-ink pt-6">
          <p className="font-serif text-2xl">
            {theme ? `No published testimonies on ${theme} yet.` : "The first testimonies are being reviewed."}
          </p>
          <p className="mt-3 text-ink-soft">
            We publish only what participants have allowed, after editorial review.{" "}
            <Link href="/share/" className="underline hover:text-accent">
              Share your experience
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
}

function ThemeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-rule bg-card hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
