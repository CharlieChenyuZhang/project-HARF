import type { Metadata } from "next";
import Link from "next/link";
import { SURVEY_URL } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Take the survey",
  description: "HARF's structured questionnaire on AI, thinking, learning and intellectual autonomy.",
};

export default function SurveyPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
      <div className="grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <div>
          <p className="eyebrow">Structured research</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">The survey captures what we know to ask.</h1>
          <p className="mt-6 leading-relaxed text-ink-soft">
            This questionnaire, running within the Boston academic community, explores people&apos;s experiences with
            AI — particularly its effects on thinking, learning and intellectual autonomy. Structured answers let us
            identify patterns and compare responses.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            The survey is run separately from the open testimonies, through Tally. If there is something it
            doesn&apos;t ask about,{" "}
            <Link href="/share/" className="underline hover:text-accent">
              tell us in your own words
            </Link>
            .
          </p>
          <a
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-ink px-7 py-3 text-sm uppercase tracking-[0.14em] text-paper hover:bg-accent"
          >
            Open the survey ↗
          </a>
        </div>
        <div className="min-h-[640px] overflow-hidden rounded-sm border border-rule bg-card">
          <iframe
            src="https://tally.so/embed/RWKrVl?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=0"
            title="HARF survey"
            loading="lazy"
            className="h-[720px] w-full"
          />
        </div>
      </div>
    </div>
  );
}
