import { createHash } from "node:crypto";

/** One-way fingerprint of a participant code; the code itself is never stored. */
export const participantRefFor = (code: string) => createHash("sha256").update(`harf:${code}`).digest("hex");

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
