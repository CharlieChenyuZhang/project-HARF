import type { Metadata } from "next";
import { CircleLink } from "@/components/circle-link";
import { PageHero } from "@/components/page-hero";
import { SURVEY_URL } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Take the survey",
  description: "HARF's structured questionnaire on AI, thinking, learning and intellectual autonomy.",
};

export default function SurveyPage() {
  return (
    <>
      <PageHero eyebrow="Structured research" title="The survey captures what we know to ask.">
        AI, thinking, learning and intellectual autonomy — within the Boston academic community.
      </PageHero>
      <div className="mx-auto max-w-4xl px-5 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <CircleLink href={SURVEY_URL} external>
            Open in a new tab
          </CircleLink>
          <CircleLink href="/share/">Or tell us in your own words</CircleLink>
        </div>
        <div className="overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-rule">
          <iframe
            src="https://tally.so/embed/RWKrVl?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=0"
            title="HARF survey"
            loading="lazy"
            className="h-[760px] w-full"
          />
        </div>
      </div>
    </>
  );
}
