import { Database, Eye, Hourglass, KeyRound, Lock, Mail, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { IconCard, PageHero } from "@/components/page-hero";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/harf";

export const metadata: Metadata = {
  title: "Privacy & consent",
  description: "How HARF uses, retains, protects and removes the testimonies people share.",
};

const SECTIONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Database,
    title: "What we collect",
    body: "Your testimony, any images, audio or video you attach, and, only if you choose, a little context (role, field, country, AI use, feelings). No name or institution is required.",
  },
  {
    icon: Eye,
    title: "Publication",
    body: "Nothing is published automatically. With your permission, an editor may publish a short anonymized excerpt. The system refuses anything without that permission.",
  },
  {
    icon: Mail,
    title: "Contact details",
    body: "Collected only if you ask to be contacted. Stored in a separate table, visible only to editors, never published.",
  },
  {
    icon: KeyRound,
    title: "Your participant code",
    body: "Links your future contributions without identifying you. We store only a one-way fingerprint (SHA-256), so we can't recover it.",
  },
  {
    icon: Lock,
    title: "Storage & protection",
    body: "Amazon Web Services, United States (Ohio): text in a database, attachments in private file storage. Encrypted in transit and at rest. Only signed-in editors can see private records or files.",
  },
  {
    icon: Hourglass,
    title: "Retention & removal",
    body: "Kept for the life of the archive unless you ask us to remove it. Removal deletes the text and attachments; backups clear after 35 days.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy & consent" title="How we treat what you share">
        Your original words are kept exactly as written. You decide what else happens.
      </PageHero>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
          Draft for review — to be finalized, with a contact address for removal requests, before real submissions open.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <IconCard key={title} icon={<Icon aria-hidden className="size-6" strokeWidth={1.6} />} title={title}>
              {body}
            </IconCard>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-3xl">Your three choices</h2>
          <p className="mt-1 text-sm text-muted">Consent version {CONSENT_VERSION}, recorded with every contribution.</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Research", "Required", CONSENT_TEXT.research],
              ["Publication", "Optional", CONSENT_TEXT.publish],
              ["Follow-up", "Optional", CONSENT_TEXT.contact],
            ].map(([title, kind, text], i) => (
              <li key={title} className="rounded-lg bg-card p-6 ring-1 ring-rule">
                <p className="flex items-baseline justify-between">
                  <span className="font-serif text-xl">
                    {i + 1}. {title}
                  </span>
                  <span className="text-xs uppercase tracking-[0.14em] text-muted">{kind}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">The structured survey is hosted by Tally and covered by its own notice.</p>
        </section>
      </div>
    </>
  );
}
