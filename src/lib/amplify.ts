"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);

/** Guests (participants) use the identity pool; editors pass authMode "userPool". */
export const client = generateClient<Schema>();

export type Testimony = Schema["Testimony"]["type"];
export type Excerpt = Schema["Excerpt"]["type"];
export type WeeklyQuestion = Schema["WeeklyQuestion"]["type"];
export type Contact = Schema["Contact"]["type"];

export function errorMessage(errors: readonly { message: string }[] | undefined | null, fallback: string) {
  return errors?.length ? errors.map((e) => e.message).join(" ") : fallback;
}

/** Read every page of a list query. */
export async function listAll<T>(
  fetchPage: (nextToken?: string | null) => Promise<{ data: T[]; nextToken?: string | null; errors?: readonly { message: string }[] }>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const page = await fetchPage(nextToken);
    if (page.errors?.length) throw new Error(errorMessage(page.errors, "Request failed."));
    items.push(...page.data);
    nextToken = page.nextToken;
  } while (nextToken);
  return items;
}

/** The most recent active Question of the Week, if any. */
export async function fetchCurrentWeeklyQuestion(): Promise<WeeklyQuestion | null> {
  const questions = await listAll((nextToken) =>
    client.models.WeeklyQuestion.list({ filter: { active: { eq: true } }, nextToken }),
  );
  return questions.sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0] ?? null;
}
