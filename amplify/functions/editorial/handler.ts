import { randomUUID } from "node:crypto";
import type { AppSyncResolverEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { LIMITS, THEMES } from "../../../src/lib/harf";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const TESTIMONY_TABLE = process.env.TESTIMONY_TABLE!;
const EXCERPT_TABLE = process.env.EXCERPT_TABLE!;
const CONTACT_TABLE = process.env.CONTACT_TABLE!;
const MEDIA_BUCKET = process.env.MEDIA_BUCKET!;

const s3 = new S3Client({});

type PublishArgs = {
  testimonyId: string;
  text: string;
  themes?: (string | null)[] | null;
  participantCategory?: string | null;
};

async function loadTestimony(id: string) {
  const res = await db.send(new GetCommand({ TableName: TESTIMONY_TABLE, Key: { id } }));
  if (!res.Item) throw new Error("Testimony not found.");
  return res.Item;
}

/**
 * Publication is the one place where private material becomes public, so the
 * consent check lives here on the server rather than only in the dashboard.
 */
async function publish(args: PublishArgs) {
  const testimony = await loadTestimony(args.testimonyId);
  if (testimony.consentPublish !== true) {
    throw new Error("This participant did not give permission to publish an excerpt.");
  }
  if (testimony.editorialStatus === "WITHDRAWN") {
    throw new Error("This testimony was withdrawn and cannot be published.");
  }
  const text = args.text.trim();
  if (!text) throw new Error("The excerpt is empty.");
  if (text.length > LIMITS.excerptMax) throw new Error(`Excerpts are limited to ${LIMITS.excerptMax} characters.`);

  const themes = (args.themes ?? []).filter((t): t is string => !!t && (THEMES as readonly string[]).includes(t));
  const now = new Date().toISOString();
  const excerptId = (testimony.excerptId as string | undefined) ?? randomUUID();
  // Re-publishing replaces the excerpt; keep an editor's "featured" choice.
  const existing = testimony.excerptId
    ? (await db.send(new GetCommand({ TableName: EXCERPT_TABLE, Key: { id: excerptId } }))).Item
    : undefined;
  const excerpt = {
    id: excerptId,
    __typename: "Excerpt",
    createdAt: now,
    updatedAt: now,
    text,
    themes,
    participantCategory: args.participantCategory?.trim() || testimony.relationship || "Participant",
    language: testimony.language,
    // Only the month is shown publicly; the exact timestamp stays private.
    contributedOn: `${(testimony.submittedAt as string).slice(0, 7)}-01`,
    publishedAt: now,
    synthetic: testimony.synthetic === true,
    featured: existing?.featured === true,
  };

  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        { Put: { TableName: EXCERPT_TABLE, Item: excerpt } },
        {
          Update: {
            TableName: TESTIMONY_TABLE,
            Key: { id: testimony.id },
            UpdateExpression:
              "SET excerptId = :e, excerptDraft = :t, themes = :th, editorialStatus = :s, reviewedAt = :n, updatedAt = :n",
            ConditionExpression: "consentPublish = :true",
            ExpressionAttributeValues: {
              ":e": excerptId,
              ":t": text,
              ":th": themes,
              ":s": "PUBLISHED",
              ":n": now,
              ":true": true,
            },
          },
        },
      ],
    }),
  );
  return excerpt;
}

async function unpublish(testimonyId: string) {
  const testimony = await loadTestimony(testimonyId);
  if (!testimony.excerptId) return true;
  const now = new Date().toISOString();
  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        { Delete: { TableName: EXCERPT_TABLE, Key: { id: testimony.excerptId } } },
        {
          Update: {
            TableName: TESTIMONY_TABLE,
            Key: { id: testimonyId },
            UpdateExpression: "REMOVE excerptId SET editorialStatus = :s, updatedAt = :n",
            ExpressionAttributeValues: {
              ":s": testimony.editorialStatus === "WITHDRAWN" ? "WITHDRAWN" : "APPROVED",
              ":n": now,
            },
          },
        },
      ],
    }),
  );
  return true;
}

async function remove(testimonyId: string) {
  const testimony = await loadTestimony(testimonyId);
  await db.send(
    new TransactWriteCommand({
      TransactItems: [
        { Delete: { TableName: TESTIMONY_TABLE, Key: { id: testimonyId } } },
        ...(testimony.excerptId ? [{ Delete: { TableName: EXCERPT_TABLE, Key: { id: testimony.excerptId } } }] : []),
        ...(testimony.contactId ? [{ Delete: { TableName: CONTACT_TABLE, Key: { id: testimony.contactId } } }] : []),
      ],
    }),
  );
  const media = (testimony.media as { key: string }[] | undefined) ?? [];
  if (media.length) {
    await s3.send(
      new DeleteObjectsCommand({ Bucket: MEDIA_BUCKET, Delete: { Objects: media.map((m) => ({ Key: m.key })) } }),
    );
  }
  return true;
}

// Amplify function resolvers receive the field name at the top level of the
// event; plain AppSync Lambda resolvers nest it under `info`.
type ResolverEvent = AppSyncResolverEvent<Record<string, unknown>> & { fieldName?: string };

export const handler = async (event: ResolverEvent) => {
  const fieldName = event.fieldName ?? event.info?.fieldName;
  switch (fieldName) {
    case "publishExcerpt":
      return publish(event.arguments as unknown as PublishArgs);
    case "unpublishExcerpt":
      return unpublish(event.arguments.testimonyId as string);
    case "removeTestimony":
      return remove(event.arguments.testimonyId as string);
    default:
      throw new Error(`Unsupported operation ${fieldName}`);
  }
};
