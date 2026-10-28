import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { ArchiveView } from "./archive-view";

export const metadata: Metadata = {
  title: "The Living Archive",
  description: "Selected, anonymized testimonies about the human experience of AI, published with consent.",
};

export default function ArchivePage() {
  return (
    <>
      <PageHero eyebrow="The Living Archive" title="How people are experiencing the AI transition">
        Anonymized excerpts, published with permission after editorial review.
      </PageHero>
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Suspense>
          <ArchiveView />
        </Suspense>
      </div>
    </>
  );
}
