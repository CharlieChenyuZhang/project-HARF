// How other participants answered, as broad and rounded counts. Shared by the
// participant function (which computes it) and the site (which draws it).
import { AI_TOOLS, AI_USE_FREQUENCIES, FEELINGS, NOTICED_CHANGE } from "./harf";
import { TONES } from "./tone";

/** Groups smaller than this are never returned. Counts are rounded to the same step. */
export const MIN_GROUP = 5;

export const COMMUNITY_DIMENSIONS = [
  { key: "tone", title: "The tone of stories shared so far", options: TONES },
  { key: "feelings", title: "How people feel about AI", options: FEELINGS.filter((f) => f !== "Other") },
  { key: "aiUseFrequency", title: "How often people use AI", options: AI_USE_FREQUENCIES },
  { key: "mainAiTool", title: "The AI tools people use most", options: AI_TOOLS.filter((t) => t !== "Other") },
  { key: "noticedChange", title: "What people have noticed", options: NOTICED_CHANGE },
] as const;
export type CommunityDimension = (typeof COMMUNITY_DIMENSIONS)[number]["key"];

export type CommunityRow = {
  dimension: CommunityDimension;
  label: string;
  /** People in this group, rounded to the nearest MIN_GROUP. */
  count: number;
  /** People who answered this question at all, rounded the same way. */
  respondents: number;
};

export type CommunityRecord = Partial<Record<CommunityDimension, string | string[] | null>> & {
  participantRef?: string | null;
  synthetic?: boolean | null;
  editorialStatus?: string | null;
};

const rounded = (n: number) => Math.round(n / MIN_GROUP) * MIN_GROUP;

/** Counts people rather than stories, so one person writing often can't fill a group alone. */
export function summarizeCommunity(records: CommunityRecord[]): CommunityRow[] {
  const real = records.filter((r) => !r.synthetic && r.editorialStatus !== "WITHDRAWN" && r.participantRef);
  return COMMUNITY_DIMENSIONS.flatMap(({ key, options }) => {
    const groups = new Map<string, Set<string>>();
    const respondents = new Set<string>();
    for (const record of real) {
      const raw = record[key];
      const answers = (Array.isArray(raw) ? raw : [raw]).filter((a) => (options as readonly unknown[]).includes(a));
      if (answers.length) respondents.add(record.participantRef!);
      for (const answer of answers as string[]) {
        groups.set(answer, (groups.get(answer) ?? new Set()).add(record.participantRef!));
      }
    }
    return options.flatMap((label) => {
      const size = groups.get(label)?.size ?? 0;
      return size < MIN_GROUP
        ? []
        : [{ dimension: key, label, count: rounded(size), respondents: rounded(respondents.size) }];
    });
  });
}
