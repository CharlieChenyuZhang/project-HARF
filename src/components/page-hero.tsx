import type { ReactNode } from "react";

/** Navy title band used at the top of inner pages. */
export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-navy text-card">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
        <p className="text-xs uppercase tracking-[0.2em] text-card/60">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
        {children ? <div className="mt-5 max-w-2xl text-lg text-card/75">{children}</div> : null}
      </div>
    </section>
  );
}

export function IconCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-card p-7 shadow-sm ring-1 ring-rule">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">{icon}</span>
      <h2 className="mt-5 font-serif text-xl">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
