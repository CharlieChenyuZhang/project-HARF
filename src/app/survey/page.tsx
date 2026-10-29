import type { Metadata } from "next";
import { CircleLink } from "@/components/circle-link";
import { PageHero } from "@/components/page-hero";
import { SURVEY_URL } from "@/components/site-chrome";
import { SurveyEmbed } from "./survey-embed";

export const metadata: Metadata = {
  title: "Take the survey",
  description: "HARF's structured questionnaire on AI, thinking, learning and intellectual autonomy.",
};

export default function SurveyPage() {
  return (
    <>
      <PageHero eyebrow="Structured research · about 5–7 minutes" title="Answer structured questions about your experience.">
        The survey collects comparable answers; your story, if you share one, captures what the questions don&apos;t.
      </PageHero>
      <div className="mx-auto max-w-4xl px-5 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <span data-track="survey_click" data-track-from="survey_new_tab">
            <CircleLink href={SURVEY_URL} external>
              Open in a new tab
            </CircleLink>
          </span>
          <span data-track="share_click" data-track-from="survey_page">
            <CircleLink href="/share/">Or tell us in your own words</CircleLink>
          </span>
        </div>
        <SurveyEmbed />
      </div>
    </>
  );
}
