import type { Excerpt } from "@/lib/amplify";

export function formatMonth(date: string | null | undefined) {
  if (!date) return "";
  return new Date(`${date.slice(0, 7)}-15T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ExcerptCard({ excerpt, size = "md" }: { excerpt: Excerpt; size?: "md" | "lg" }) {
  return (
    <article className="flex h-full flex-col border-t border-ink pt-5">
      <blockquote
        className={`font-serif leading-snug text-ink ${size === "lg" ? "text-2xl sm:text-[1.7rem]" : "text-xl"}`}
      >
        <span aria-hidden className="mr-1 text-accent">“</span>
        {excerpt.text}
        <span aria-hidden className="ml-0.5 text-accent">”</span>
      </blockquote>
      <footer className="mt-auto pt-6 text-sm text-muted">
        <p>
          {excerpt.participantCategory}
          {excerpt.contributedOn ? ` · ${formatMonth(excerpt.contributedOn)}` : ""}
        </p>
        {excerpt.themes?.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {excerpt.themes.filter(Boolean).map((t) => (
              <li key={t} className="rounded-full border border-rule px-2.5 py-0.5 text-xs text-ink-soft">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        {excerpt.synthetic ? <p className="mt-3 text-xs italic">Fictional sample entry</p> : null}
      </footer>
    </article>
  );
}
