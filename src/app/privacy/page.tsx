import type { Metadata } from "next";
import Link from "next/link";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/harf";

export const metadata: Metadata = {
  title: "Privacy & consent",
  description: "How HARF uses, retains, protects and removes the testimonies people share.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <>
        <p>
          The testimony you write, the language it is written in, and the prompt or Question of the Week you responded
          to, if any. Optionally: your relationship with AI (student, educator…), field of study or work, country,
          how often you use AI, and how you feel about it.
        </p>
        <p>
          We do not ask for your name or institution. If you agree to be contacted, we also store the email address and
          name or initials you give us.
        </p>
      </>
    ),
  },
  {
    title: "How we use it",
    body: (
      <>
        <p>
          To build a research archive of how people experience artificial intelligence, to identify themes and changes
          over time, and to inform essays, reports and other editorial work produced by HARF.
        </p>
        <p>
          Your original words are preserved exactly as written. Editors may add thematic tags and notes alongside them
          but never change the original.
        </p>
      </>
    ),
  },
  {
    title: "Publication",
    body: (
      <p>
        Nothing is published automatically. If you allow it, an editor may select a short excerpt, remove anything that
        could identify you, and publish it in the Living Archive with only a broad category (for example
        &ldquo;Student&rdquo;), the month of contribution and themes. The publishing system refuses any testimony
        whose author did not give this permission.
      </p>
    ),
  },
  {
    title: "Contact details",
    body: (
      <p>
        Contact information is optional, is only collected if you ask to be contacted, is stored in a separate table
        from testimonies, is visible only to HARF editors, and is never published.
      </p>
    ),
  },
  {
    title: "Your participant code",
    body: (
      <p>
        After you submit, you receive a private code. If you return later and enter it, your new testimony is linked
        to your earlier ones so we can see how experiences change, without knowing who you are. We store only a
        one-way fingerprint (a SHA-256 hash) of the code, so we cannot look it up or recover it for you.
      </p>
    ),
  },
  {
    title: "Storage and protection",
    body: (
      <p>
        Data is stored on Amazon Web Services in the United States (Ohio region), encrypted in transit and at rest.
        Access to private records is limited to signed-in HARF editors. Databases are continuously backed up, which
        allows recovery to any point within the previous 35 days. Editors can export records for analysis; exports
        are handled as confidential research data.
      </p>
    ),
  },
  {
    title: "Retention and removal",
    body: (
      <p>
        Because HARF is a long-term historical archive, contributions are kept for the life of the archive unless you
        ask us to remove them. You can withdraw your contribution or ask for a published excerpt to be taken down at
        any time; tell us your participant code or the approximate date and content of your contribution. Removed
        records also disappear from backups once the 35-day backup window has passed.
      </p>
    ),
  },
  {
    title: "The survey",
    body: (
      <p>
        The structured survey is hosted by Tally and runs separately from the open testimonies. Responses there are
        covered by the survey&apos;s own notice and by Tally&apos;s privacy policy.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 sm:pt-20">
      <p className="eyebrow">Privacy &amp; consent</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">How we treat what you share</h1>
      <p className="mt-6 rounded-sm border border-accent/40 bg-accent-soft px-4 py-3 text-sm">
        Draft for review. This notice will be finalized, together with contact details for removal requests, before
        HARF opens to real submissions.
      </p>

      <div className="mt-12 space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.title} className="grid gap-3 border-t border-rule pt-6 sm:grid-cols-[1fr_2fr] sm:gap-10">
            <h2 className="font-serif text-xl">{s.title}</h2>
            <div className="prose-harf leading-relaxed text-ink-soft">{s.body}</div>
          </section>
        ))}

        <section className="border-t border-ink pt-6">
          <h2 className="font-serif text-xl">The three choices you make</h2>
          <p className="mt-2 text-sm text-muted">Consent version {CONSENT_VERSION}, recorded with every contribution.</p>
          <ol className="mt-6 space-y-4 text-ink-soft">
            <li><strong className="text-ink">1. Research (required).</strong> {CONSENT_TEXT.research}</li>
            <li><strong className="text-ink">2. Publication (optional).</strong> {CONSENT_TEXT.publish}</li>
            <li><strong className="text-ink">3. Follow-up (optional).</strong> {CONSENT_TEXT.contact}</li>
          </ol>
        </section>
      </div>

      <Link href="/share/" className="mt-14 inline-block border-b border-ink pb-0.5 text-sm hover:text-accent">
        Share your experience →
      </Link>
    </div>
  );
}
