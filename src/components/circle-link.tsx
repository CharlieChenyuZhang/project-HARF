import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** The round-arrow call to action used across the site. */
export function CircleLink({
  href,
  children,
  tone = "dark",
  external,
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light";
  external?: boolean;
}) {
  const circle =
    tone === "light"
      ? "bg-card text-ink group-hover:bg-accent group-hover:text-card"
      : "bg-ink text-card group-hover:bg-accent";
  const content = (
    <>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors ${circle}`}>
        <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-0.5" />
      </span>
      <span className="font-medium">{children}</span>
    </>
  );
  const className = "group inline-flex items-center gap-3";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
