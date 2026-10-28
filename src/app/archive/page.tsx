import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchiveView } from "./archive-view";

export const metadata: Metadata = {
  title: "The Living Archive",
  description: "Selected, anonymized testimonies about the human experience of AI, published with consent.",
};

export default function ArchivePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
      <header className="mb-12 grid gap-8 md:grid-cols-[3fr_2fr] md:gap-16">
        <div>
          <p className="eyebrow">The Living Archive</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">How people are experiencing the AI transition</h1>
        </div>
        <p className="self-end text-sm leading-relaxed text-ink-soft">
          Each entry is an anonymized excerpt from a longer testimony, published only with the participant&apos;s
          permission and after editorial review. The original, unedited words are preserved privately. We care more
          about the quality and originality of these records than about their number.
        </p>
      </header>
      <Suspense>
        <ArchiveView />
      </Suspense>
    </div>
  );
}
