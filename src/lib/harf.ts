// Shared vocabulary for HARF. Imported by both the web app and the backend
// functions, so keep this file free of browser- or Node-only code.

export const THEMES = [
  "Learning",
  "Authorship",
  "Identity",
  "Trust",
  "Dependency",
  "Creativity",
  "Work",
  "Human Agency",
] as const;
export type Theme = (typeof THEMES)[number];

export const OPTIONAL_PROMPTS = [
  { id: "confidence", text: "Has AI changed how confident you feel about your own thinking?" },
  { id: "hidden", text: "Have you ever hidden how much you rely on AI?" },
  { id: "discovery", text: "Has AI helped you discover an ability you didn't know you had?" },
  { id: "speed", text: "Do you sometimes feel overwhelmed by the speed of technological change?" },
  { id: "learning", text: "Has AI changed how you learn or approach difficult problems?" },
  { id: "delegated", text: "Is there something you no longer do yourself because AI does it for you?" },
  {
    id: "understood",
    text: "What do you wish your professors, colleagues, or employers understood about your experience?",
  },
] as const;

export const MAIN_PROMPT =
  "What's happening in your relationship with AI that you haven't had the chance to talk about?";

export const RELATIONSHIPS = ["Student", "Educator", "Researcher", "Professional", "Other"] as const;

export const AI_USE_FREQUENCIES = [
  "Several times a day",
  "About daily",
  "A few times a week",
  "A few times a month",
  "Rarely",
  "Never",
] as const;

export const FEELINGS = [
  "Excited",
  "Empowered",
  "Curious",
  "Anxious",
  "Overwhelmed",
  "Dependent",
  "Conflicted",
  "Skeptical",
  "Other",
] as const;

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "other", label: "Other" },
] as const;

export const EDITORIAL_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
  "WITHDRAWN",
] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

/**
 * The consent wording a participant agrees to. Bump the version whenever the
 * text changes: every testimony stores the version it was submitted under.
 */
export const CONSENT_VERSION = "2026-10-28.v1";

export const CONSENT_TEXT = {
  research:
    "I agree that HARF may store my contribution and analyze it for the research purposes described in the privacy notice. This is required to submit.",
  publish:
    "HARF may publish an anonymized excerpt of my contribution in the Living Archive after editorial review. Nothing is published automatically.",
  contact:
    "HARF may contact me about a future interview or follow-up. My contact details are stored separately from my testimony and never published.",
} as const;

export const LIMITS = {
  testimonyMin: 20,
  testimonyMax: 20000,
  shortField: 120,
  excerptMax: 2000,
} as const;

/** Attachments: images, audio and video, checked again on the server. */
export const MEDIA = {
  maxFiles: 5,
  maxBytes: 50 * 1024 * 1024,
  types: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "video/mp4",
    "video/quicktime",
    "video/webm",
  ],
} as const;

export function isAllowedMediaType(type: string): boolean {
  return (MEDIA.types as readonly string[]).includes(type);
}

/** Participant codes look like HARF-7K2M-QX9D-4TPA (60 bits of entropy). */
export const PARTICIPANT_CODE_PATTERN = /^HARF-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
export const PARTICIPANT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeParticipantCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("HARF") ? raw.slice(4) : raw;
  if (body.length !== 12) return input.trim().toUpperCase();
  return `HARF-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}
