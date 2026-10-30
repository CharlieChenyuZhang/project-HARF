/**
 * Checks the public (guest) access rules against the deployed backend:
 * guests may read the archive and submit, and nothing else.
 *
 *   npx tsx scripts/check-access.mts
 */
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { readFileSync } from "node:fs";
import type { Schema } from "../amplify/data/resource";
import { CONSENT_VERSION } from "../src/lib/harf";

Amplify.configure(JSON.parse(readFileSync(new URL("../amplify_outputs.json", import.meta.url), "utf8")));
const client = generateClient<Schema>();

let failures = 0;
async function expect(name: string, shouldSucceed: boolean, run: () => Promise<{ data?: unknown; errors?: unknown[] }>) {
  let ok: boolean;
  try {
    const res = await run();
    ok = !res.errors?.length && res.data != null;
  } catch {
    ok = false;
  }
  const pass = ok === shouldSucceed;
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} (${ok ? "allowed" : "denied"})`);
}

await expect("guest reads published excerpts", true, () => client.models.Excerpt.list());
await expect("guest reads weekly questions", true, () => client.models.WeeklyQuestion.list());
await expect("guest cannot list testimonies", false, () => client.models.Testimony.list());
await expect("guest cannot list contacts", false, () => client.models.Contact.list());
await expect("guest cannot create excerpts", false, () =>
  client.models.Excerpt.create({ text: "x", publishedAt: new Date().toISOString() }),
);
await expect("guest cannot create weekly questions", false, () =>
  client.models.WeeklyQuestion.create({ question: "x", weekOf: "2026-01-01", active: true }),
);
await expect("guest cannot read analytics events", false, () => client.models.AnalyticsEvent.list());
await expect("guest cannot read withdrawal requests", false, () => client.models.WithdrawalRequest.list());
await expect("guest cannot feature an excerpt", false, () => client.models.Excerpt.update({ id: "any", featured: true }));
await expect("guest cannot record an unknown event", false, () => client.mutations.track({ name: "not_an_event" }));
await expect("guest cannot attach a revisit email to someone else's story", false, () =>
  client.mutations.requestRevisit({
    email: "someone@example.com",
    consent: true,
    consentVersion: CONSENT_VERSION,
    source: "story",
    testimonyId: "not-theirs",
    participantCode: "HARF-AAAA-BBBB-CCCC",
  }),
);
await expect("guest cannot publish", false, () =>
  client.mutations.publishExcerpt({ testimonyId: "seed-0001", text: "x" }),
);
await expect("submission without research consent is rejected", false, () =>
  client.mutations.submitTestimony({
    text: "This should never be stored because consent is missing.",
    consentResearch: false,
    consentPublish: false,
    consentContact: false,
    consentVersion: CONSENT_VERSION,
  }),
);

process.exit(failures ? 1 : 0);
