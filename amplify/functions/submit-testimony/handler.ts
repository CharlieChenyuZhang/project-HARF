import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import type { Schema } from "../../data/resource";
import {
  AI_USE_FREQUENCIES,
  CONSENT_VERSION,
  FEELINGS,
  LANGUAGES,
  LIMITS,
  OPTIONAL_PROMPTS,
  PARTICIPANT_CODE_ALPHABET,
  PARTICIPANT_CODE_PATTERN,
  RELATIONSHIPS,
  normalizeParticipantCode,
} from "../../../src/lib/harf";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const TESTIMONY_TABLE = process.env.TESTIMONY_TABLE!;
const CONTACT_TABLE = process.env.CONTACT_TABLE!;
const WEEKLY_QUESTION_TABLE = process.env.WEEKLY_QUESTION_TABLE!;

class ValidationError extends Error {}

function clean(value: string | null | undefined, max: number = LIMITS.shortField): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > max) throw new ValidationError(`A field is longer than ${max} characters.`);
  return trimmed;
}

function oneOf<T extends readonly string[]>(value: string | null | undefined, allowed: T): T[number] | undefined {
  const v = clean(value);
  if (v === undefined) return undefined;
  if (!(allowed as readonly string[]).includes(v)) throw new ValidationError(`Unexpected value: ${v}`);
  return v;
}

function newParticipantCode(): string {
  const bytes = randomBytes(12);
  const chars = Array.from(bytes, (b) => PARTICIPANT_CODE_ALPHABET[b % PARTICIPANT_CODE_ALPHABET.length]);
  return `HARF-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}`;
}

const participantRefFor = (code: string) => createHash("sha256").update(`harf:${code}`).digest("hex");

export const handler: Schema["submitTestimony"]["functionHandler"] = async (event) => {
  const args = event.arguments;

  // Honeypot filled in: behave as if it worked, store nothing.
  if (args.website) {
    return { testimonyId: randomUUID(), participantCode: newParticipantCode(), entryNumber: 1 };
  }

  try {
    const text = (args.text ?? "").trim();
    if (text.length < LIMITS.testimonyMin) {
      throw new ValidationError(`Please write at least ${LIMITS.testimonyMin} characters.`);
    }
    if (text.length > LIMITS.testimonyMax) {
      throw new ValidationError(`Testimonies are limited to ${LIMITS.testimonyMax} characters.`);
    }
    if (args.consentResearch !== true) {
      throw new ValidationError("Consent to store and analyze the contribution is required.");
    }
    if (args.consentVersion !== CONSENT_VERSION) {
      throw new ValidationError("The consent text has changed. Please reload the page and review it again.");
    }

    const channel = args.channel === "WEEKLY_QUESTION" ? "WEEKLY_QUESTION" : "OPEN";
    let promptId: string | undefined;
    let promptText: string | undefined;
    let weeklyQuestionId: string | undefined;

    if (channel === "WEEKLY_QUESTION") {
      weeklyQuestionId = clean(args.weeklyQuestionId, 64);
      if (!weeklyQuestionId) throw new ValidationError("Missing weekly question.");
      const res = await db.send(
        new QueryCommand({
          TableName: WEEKLY_QUESTION_TABLE,
          KeyConditionExpression: "id = :id",
          ExpressionAttributeValues: { ":id": weeklyQuestionId },
        }),
      );
      const question = res.Items?.[0];
      if (!question) throw new ValidationError("Unknown weekly question.");
      promptId = `weekly:${weeklyQuestionId}`;
      promptText = question.question as string;
    } else if (args.promptId) {
      const prompt = OPTIONAL_PROMPTS.find((p) => p.id === args.promptId);
      if (!prompt) throw new ValidationError("Unknown prompt.");
      promptId = prompt.id;
      promptText = prompt.text;
    }

    let participantCode = newParticipantCode();
    if (args.participantCode) {
      const normalized = normalizeParticipantCode(args.participantCode);
      if (!PARTICIPANT_CODE_PATTERN.test(normalized)) {
        throw new ValidationError("That participant code doesn't look right. It has the form HARF-XXXX-XXXX-XXXX.");
      }
      participantCode = normalized;
    }
    const participantRef = participantRefFor(participantCode);

    const previous = await db.send(
      new QueryCommand({
        TableName: TESTIMONY_TABLE,
        IndexName: "byParticipant",
        KeyConditionExpression: "participantRef = :p",
        ExpressionAttributeValues: { ":p": participantRef },
        Select: "COUNT",
      }),
    );
    const entryNumber = (previous.Count ?? 0) + 1;

    const feelings = (args.feelings ?? [])
      .filter((f): f is string => typeof f === "string")
      .map((f) => oneOf(f, FEELINGS)!)
      .filter((f, i, all) => all.indexOf(f) === i);

    const language = oneOf(
      args.language,
      LANGUAGES.map((l) => l.code),
    );

    const now = new Date().toISOString();
    const testimonyId = randomUUID();
    const consentContact = args.consentContact === true;
    const contactEmail = consentContact ? clean(args.contactEmail, 254) : undefined;
    const contactName = consentContact ? clean(args.contactName) : undefined;
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      throw new ValidationError("Please check the email address.");
    }
    const contactId = contactEmail ? randomUUID() : undefined;

    const testimony = {
      id: testimonyId,
      __typename: "Testimony",
      createdAt: now,
      updatedAt: now,
      submittedAt: now,
      language,
      originalText: text,
      channel,
      promptId,
      promptText,
      weeklyQuestionId,
      participantRef,
      entryNumber,
      relationship: oneOf(args.relationship, RELATIONSHIPS),
      fieldOfWork: clean(args.fieldOfWork),
      country: clean(args.country),
      aiUseFrequency: oneOf(args.aiUseFrequency, AI_USE_FREQUENCIES),
      feelings: feelings.length ? feelings : undefined,
      feelingsOther: feelings.includes("Other") ? clean(args.feelingsOther) : undefined,
      consentResearch: true,
      consentPublish: args.consentPublish === true,
      consentContact,
      consentVersion: CONSENT_VERSION,
      consentRecordedAt: now,
      contactId,
      synthetic: false,
      editorialStatus: "NEW",
      themes: [],
    };

    if (contactId) {
      await db.send(
        new TransactWriteCommand({
          TransactItems: [
            { Put: { TableName: TESTIMONY_TABLE, Item: testimony } },
            {
              Put: {
                TableName: CONTACT_TABLE,
                Item: {
                  id: contactId,
                  __typename: "Contact",
                  createdAt: now,
                  updatedAt: now,
                  testimonyId,
                  participantRef,
                  name: contactName,
                  email: contactEmail,
                },
              },
            },
          ],
        }),
      );
    } else {
      await db.send(new PutCommand({ TableName: TESTIMONY_TABLE, Item: testimony }));
    }

    return { testimonyId, participantCode, entryNumber };
  } catch (err) {
    if (err instanceof ValidationError) throw new Error(err.message);
    console.error("submitTestimony failed", err);
    throw new Error("We couldn't save your testimony. Please try again in a moment.");
  }
};
