// A small, transparent word-list reading of a story's tone. Shared by the browser
// (shown to the participant) and submitTestimony (stored as a broad label), so keep
// it free of browser- or Node-only code. It reads words, not people, and English only.

export const TONES = ["Mostly negative", "Mixed", "Neutral", "Mostly positive"] as const;
export type Tone = (typeof TONES)[number];

export type ToneReading = {
  tone: Tone;
  /** -1 (all negative words) to 1 (all positive words). */
  score: number;
  positive: string[];
  negative: string[];
};

const words = (list: string) => new Set(list.split(/\s+/).filter(Boolean));

const POSITIVE = words(`
  able accessible accomplished amazing appreciate appreciated appreciative benefit benefited better boost boosted
  brilliant calm capable clarity clear clearer comfortable confident confidence convenient creative curious
  delighted delight easier easy efficient empowered empowering encouraged encouraging enjoy enjoyed enjoyable
  enthusiastic excited exciting faster free freed fun glad good grateful great growth happy helpful helped helps
  hope hopeful impressed improve improved improving insight insightful inspire inspired inspiring interesting joy
  love loved motivated optimistic positive powerful productive progress proud relief relieved reassured
  reassuring satisfied satisfying stronger succeed succeeded success supported supportive thrilled understood
  useful valuable welcome wonderful
`);

const NEGATIVE = words(`
  afraid alone anxious anxiety ashamed awful bad betrayed bored burnout concern concerned concerning confused
  confusing conflicted cheating cheated crutch dependent dependency depressed disappointed disappointing
  disconnected discouraged disturbing doubt doubted doubting doubts dread embarrassed empty exhausted exhausting
  fail failed failing failure fear fearful fears frightened frustrated frustrating guilt guilty hard harmful hate
  hated helpless hopeless hurt inadequate inferior insecure isolated lazy lonely lose losing lost misleading
  mistrust nervous overwhelmed overwhelming panic pressure problem problems regret replaced sad scared shame
  skeptical stress stressed stressful struggle struggled struggling stuck terrified threatened tired trapped
  uncomfortable uneasy unhappy unsure upset useless worried worries worry worse worthless wrong
`);

const NEGATORS = words(
  `not no never without hardly barely cannot can't don't didn't doesn't isn't wasn't won't wouldn't couldn't`,
);

// Very common English words. A story that uses few of them isn't read at all,
// rather than being given a meaningless "Neutral".
const COMMON_ENGLISH = words(`
  the a an and or but of to in on at for with from by as is am are was were be been it this that these those i my me we
  our you your he she they them his her their have has had do did does not what when how because so if about
  can could would will just more than then there which who
`);

const MIN_ENGLISH_SHARE = 0.2;
const NEGATION_WINDOW = 3;
const MIXED_BELOW = 0.34;

/** The reading of a text, or null when it doesn't look like English. */
export function readTone(text: string): ToneReading | null {
  const tokens =
    text
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .match(/[\p{L}\p{N}']+/gu) ?? [];
  if (!tokens.length) return null;
  if (tokens.filter((t) => COMMON_ENGLISH.has(t)).length / tokens.length < MIN_ENGLISH_SHARE) return null;

  const positive: string[] = [];
  const negative: string[] = [];
  tokens.forEach((token, i) => {
    const isPositive = POSITIVE.has(token);
    if (!isPositive && !NEGATIVE.has(token)) return;
    const negated = tokens.slice(Math.max(0, i - NEGATION_WINDOW), i).some((t) => NEGATORS.has(t));
    const phrase = negated ? `not ${token}` : token;
    (isPositive !== negated ? positive : negative).push(phrase);
  });

  const total = positive.length + negative.length;
  const score = total ? (positive.length - negative.length) / total : 0;
  const tone: Tone = !total
    ? "Neutral"
    : Math.abs(score) < MIXED_BELOW
      ? "Mixed"
      : score > 0
        ? "Mostly positive"
        : "Mostly negative";
  return { tone, score, positive, negative };
}
