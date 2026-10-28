import { Quote } from "lucide-react";
import type { Excerpt } from "@/lib/amplify";
import { ThemeIcon } from "./icons";

export function formatMonth(date: string | null | undefined) {
  if (!date) return "";
  return new Date(`${date.slice(0, 7)}-15T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ExcerptCard({ excerpt, size = "md" }: { excerpt: Excerpt; size?: "md" | "lg" }) {
  return (
    <article className="flex h-full flex-col rounded-lg bg-card p-7 shadow-sm ring-1 ring-rule transition-shadow hover:shadow-md">
      <Quote aria-hidden className="size-7 text-accent" strokeWidth={1.5} />
      <blockquote className={`mt-4 font-serif leading-snug ${size === "lg" ? "text-2xl sm:text-3xl" : "text-xl"}`}>
        {excerpt.text}
      </blockquote>
      <footer className="mt-auto pt-6">
        {excerpt.themes?.length ? (
          <ul className="mb-4 flex flex-wrap gap-1.5">
            {excerpt.themes.filter(Boolean).map((t) => (
              <li key={t} className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs text-ink-soft">
                <ThemeIcon theme={t!} className="size-3.5" />
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="border-t border-rule pt-3 text-xs text-muted">
          {excerpt.participantCategory}
          {excerpt.contributedOn ? ` · ${formatMonth(excerpt.contributedOn)}` : ""}
          {excerpt.synthetic ? " · Fictional sample" : ""}
        </p>
      </footer>
    </article>
  );
}
