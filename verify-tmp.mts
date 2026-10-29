import { readFileSync } from "node:fs";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { AppSyncClient, paginateListGraphqlApis } from "@aws-sdk/client-appsync";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Schema } from "./amplify/data/resource";
const o = JSON.parse(readFileSync("./amplify_outputs.json", "utf8"));
Amplify.configure(o);
const guest = generateClient<Schema>();
const w = await guest.mutations.requestWithdrawal({ message: "QA TEST withdrawal request (synthetic)", participantCode: "harf-aaaa-bbbb-cccc" });
console.log("withdrawal request:", w.data, w.errors?.[0]?.message ?? "");
const bad = await guest.mutations.requestRevisit({ email: "x@example.com", consent: true, consentVersion: "2026-10-29.v3", source: "story", testimonyId: "nope", participantCode: "HARF-AAAA-BBBB-CCCC" });
console.log("revisit with wrong code rejected:", bad.errors?.[0]?.message);
const badEvent = await guest.mutations.track({ name: "steal_data" });
console.log("unknown event rejected:", badEvent.errors?.[0]?.message);

const appsync = new AppSyncClient({ region: o.data.aws_region });
let id = "";
for await (const p of paginateListGraphqlApis({ client: appsync }, {})) id ||= p.graphqlApis?.find((a) => a.uris?.GRAPHQL === o.data.url)?.apiId ?? "";
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: o.data.aws_region }));
const scan = async (t: string) => (await db.send(new ScanCommand({ TableName: `${t}-${id}-NONE` }))).Items ?? [];
const [t] = (await scan("Testimony")).filter((x) => x.originalText.startsWith("QA TEST"));
console.log("testimony:", { noticedChange: t?.noticedChange, firstNoticed: t?.firstNoticed, consentVersion: t?.consentVersion });
const contacts = await scan("Contact");
console.log("contacts:", contacts.map((c) => ({ purpose: c.purpose, source: c.source, linked: c.testimonyId === t?.id, remindAfter: c.remindAfter })));
const events = await scan("AnalyticsEvent");
const byName: Record<string, number> = {};
for (const e of events) byName[e.name] = (byName[e.name] ?? 0) + 1;
console.log("analytics events:", byName, "ttl set:", events.every((e) => typeof e.expiresAt === "number"));
const reqs = await scan("WithdrawalRequest");
console.log("withdrawal requests:", reqs.length, "hashed code:", reqs.every((r) => /^[0-9a-f]{64}$/.test(r.participantRef ?? "")));

if (process.argv.includes("--clean")) {
  const del = async (table: string, items: Record<string, unknown>[]) => {
    for (let i = 0; i < items.length; i += 25)
      await db.send(new BatchWriteCommand({ RequestItems: { [`${table}-${id}-NONE`]: items.slice(i, i + 25).map((x) => ({ DeleteRequest: { Key: { id: x.id } } })) } }));
  };
  await del("Testimony", t ? [t] : []);
  await del("Contact", contacts);
  await del("AnalyticsEvent", events);
  await del("WithdrawalRequest", reqs);
  for (const n of ["Testimony", "Contact", "AnalyticsEvent", "WithdrawalRequest", "Excerpt"]) console.log("left in", n, (await scan(n)).length);
}
