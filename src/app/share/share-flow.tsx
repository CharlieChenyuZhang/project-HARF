"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { client, errorMessage, type WeeklyQuestion } from "@/lib/amplify";
import {
  AI_USE_FREQUENCIES,
  CONSENT_TEXT,
  CONSENT_VERSION,
  FEELINGS,
  LANGUAGES,
  LIMITS,
  MAIN_PROMPT,
  OPTIONAL_PROMPTS,
  PARTICIPANT_CODE_PATTERN,
  RELATIONSHIPS,
  normalizeParticipantCode,
} from "@/lib/harf";

const DRAFT_KEY = "harf.draft";
const CODE_KEY = "harf.participantCode";

function readStorage(key: string, storage: () => Storage = () => window.localStorage) {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string | null, storage: () => Storage = () => window.localStorage) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    /* storage unavailable: drafts simply aren't kept */
  }
}
const session = () => window.sessionStorage;

type Step = "write" | "context" | "consent" | "done";
const STEPS: { id: Step; label: string }[] = [
  { id: "write", label: "Your experience" },
  { id: "context", label: "Context" },
  { id: "consent", label: "Your choices" },
];

function browserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const code = navigator.language?.slice(0, 2).toLowerCase();
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}

export function ShareFlow() {
  const params = useSearchParams();
  const weeklyId = params.get("weekly");

  const [step, setStep] = useState<Step>("write");
  const [weekly, setWeekly] = useState<WeeklyQuestion | null>(null);

  // Step 1
  const [text, setText] = useState("");
  const [promptId, setPromptId] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [returning, setReturning] = useState(false);
  const [code, setCode] = useState("");

  // Step 2
  const [relationship, setRelationship] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [country, setCountry] = useState("");
  const [frequency, setFrequency] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [feelingsOther, setFeelingsOther] = useState("");

  // Step 3
  const [consentResearch, setConsentResearch] = useState(false);
  const [consentPublish, setConsentPublish] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ participantCode: string; entryNumber: number } | null>(null);

  // Restore browser-only state after hydration (the page is statically rendered).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(browserLanguage());
    const draft = readStorage(DRAFT_KEY, session);
    if (draft) setText(draft);
    const saved = readStorage(CODE_KEY);
    if (saved) {
      setCode(saved);
      setReturning(true);
    }
  }, []);

  useEffect(() => {
    writeStorage(DRAFT_KEY, text || null, session);
  }, [text]);

  useEffect(() => {
    if (!weeklyId) return;
    client.models.WeeklyQuestion.get({ id: weeklyId })
      .then(({ data }) => setWeekly(data ?? null))
      .catch(() => setWeekly(null));
  }, [weeklyId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const textLength = text.trim().length;
  const codeValid = !returning || PARTICIPANT_CODE_PATTERN.test(normalizeParticipantCode(code));
  const canContinue = textLength >= LIMITS.testimonyMin && textLength <= LIMITS.testimonyMax && codeValid;
  const activePrompt = weekly
    ? weekly.question
    : OPTIONAL_PROMPTS.find((p) => p.id === promptId)?.text;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data, errors } = await client.mutations.submitTestimony({
        text,
        language,
        channel: weekly ? "WEEKLY_QUESTION" : "OPEN",
        promptId: weekly ? undefined : promptId ?? undefined,
        weeklyQuestionId: weekly?.id,
        participantCode: returning ? normalizeParticipantCode(code) : undefined,
        relationship: relationship || undefined,
        fieldOfWork: fieldOfWork || undefined,
        country: country || undefined,
        aiUseFrequency: frequency || undefined,
        feelings,
        feelingsOther: feelings.includes("Other") ? feelingsOther || undefined : undefined,
        consentResearch,
        consentPublish,
        consentContact,
        consentVersion: CONSENT_VERSION,
        contactName: consentContact ? contactName || undefined : undefined,
        contactEmail: consentContact ? contactEmail || undefined : undefined,
        website: website || undefined,
      });
      if (!data) throw new Error(errorMessage(errors, "Something went wrong. Please try again."));
      setResult({ participantCode: data.participantCode, entryNumber: data.entryNumber });
      writeStorage(DRAFT_KEY, null, session);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && result) return <Done result={result} />;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-12 sm:pt-16">
      <ol className="mb-12 flex gap-2 text-xs uppercase tracking-[0.14em]" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === stepIndex ? "step" : undefined}
            className={`flex-1 border-t-2 pt-2 ${i <= stepIndex ? "border-ink text-ink" : "border-rule text-muted"}`}
          >
            <span className="hidden sm:inline">{String(i + 1).padStart(2, "0")} · </span>
            {s.label}
          </li>
        ))}
      </ol>

      {step === "write" && (
        <section>
          {weekly ? (
            <>
              <p className="eyebrow">The Question of the Week</p>
              <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{weekly.question}</h1>
              {weekly.introduction ? <p className="mt-4 text-ink-soft">{weekly.introduction}</p> : null}
              <Link href="/share/" className="mt-3 inline-block text-sm text-muted underline hover:text-accent">
                Or share something else
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Share your experience</p>
              <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{MAIN_PROMPT}</h1>
              <p className="mt-5 text-ink-soft">
                Write freely, in any language, as much or as little as you like. There are no right answers — we are
                interested in contradictions and uncertainty as much as in conclusions.
              </p>
              <details className="group mt-8 border-y border-rule">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm">
                  <span>Not sure where to begin? Choose a prompt (optional)</span>
                  <span aria-hidden className="text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="space-y-1 pb-5">
                  {OPTIONAL_PROMPTS.map((p) => {
                    const selected = promptId === p.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setPromptId(selected ? null : p.id)}
                          className={`w-full rounded px-3 py-2 text-left font-serif text-lg transition-colors ${
                            selected ? "bg-accent-soft text-ink" : "text-ink-soft hover:bg-paper-deep"
                          }`}
                        >
                          {p.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </>
          )}

          <label className="mt-10 block">
            {activePrompt && !weekly ? (
              <span className="mb-3 block font-serif text-lg italic text-accent">{activePrompt}</span>
            ) : (
              <span className="sr-only">Your testimony</span>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              maxLength={LIMITS.testimonyMax}
              placeholder="Start writing…"
              className="w-full resize-y rounded-sm border border-rule bg-card px-5 py-4 font-serif text-lg leading-relaxed placeholder:text-muted/70 focus:border-ink focus:outline-none focus-visible:outline-none"
            />
          </label>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Saved in this browser tab until you submit.</span>
            <span>
              {textLength < LIMITS.testimonyMin
                ? `${LIMITS.testimonyMin - textLength} more characters to continue`
                : `${textLength.toLocaleString()} characters`}
            </span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field label="Language of your testimony">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={returning}
                  onChange={(e) => setReturning(e.target.checked)}
                  className="mt-0.5 size-4 accent-ink"
                />
                <span>
                  I&apos;ve shared before and have a participant code
                  <span className="block text-muted">So we can see how your experience changes over time.</span>
                </span>
              </label>
              {returning ? (
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="HARF-XXXX-XXXX-XXXX"
                  aria-label="Participant code"
                  className={`${inputClass} mt-3 font-mono uppercase tracking-wider`}
                />
              ) : null}
              {returning && code && !codeValid ? (
                <p className="mt-2 text-xs text-accent">Codes look like HARF-7K2M-QX9D-4TPA.</p>
              ) : null}
            </div>
          </div>

          <Nav>
            <span />
            <button type="button" disabled={!canContinue} onClick={() => setStep("context")} className={primaryButton}>
              Continue
            </button>
          </Nav>
        </section>
      )}

      {step === "context" && (
        <section>
          <p className="eyebrow">Optional</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">A little context, if you&apos;d like</h1>
          <p className="mt-4 text-ink-soft">
            Every field is optional. We never ask for your name or institution here.
          </p>

          <fieldset className="mt-10">
            <legend className="mb-3 text-sm font-medium">Your relationship with AI</legend>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => (
                <Chip key={r} selected={relationship === r} onClick={() => setRelationship(relationship === r ? "" : r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field label="Field of study or work">
              <input
                value={fieldOfWork}
                onChange={(e) => setFieldOfWork(e.target.value)}
                maxLength={LIMITS.shortField}
                placeholder="e.g. Philosophy, Nursing, Software"
                className={inputClass}
              />
            </Field>
            <Field label="Country">
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={LIMITS.shortField}
                placeholder="e.g. United States"
                className={inputClass}
              />
            </Field>
            <Field label="How often do you use AI?">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}>
                <option value="">Prefer not to say</option>
                {AI_USE_FREQUENCIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="mt-10">
            <legend className="mb-1 text-sm font-medium">How do you feel about AI right now?</legend>
            <p className="mb-3 text-sm text-muted">Choose as many as apply. Mixed feelings are welcome.</p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => {
                const selected = feelings.includes(f);
                return (
                  <Chip
                    key={f}
                    selected={selected}
                    onClick={() => setFeelings(selected ? feelings.filter((x) => x !== f) : [...feelings, f])}
                  >
                    {f}
                  </Chip>
                );
              })}
            </div>
            {feelings.includes("Other") ? (
              <input
                value={feelingsOther}
                onChange={(e) => setFeelingsOther(e.target.value)}
                maxLength={LIMITS.shortField}
                placeholder="In your own words"
                aria-label="Other feeling"
                className={`${inputClass} mt-3 max-w-sm`}
              />
            ) : null}
          </fieldset>

          <Nav>
            <button type="button" onClick={() => setStep("write")} className={secondaryButton}>
              Back
            </button>
            <button type="button" onClick={() => setStep("consent")} className={primaryButton}>
              Continue
            </button>
          </Nav>
        </section>
      )}

      {step === "consent" && (
        <section>
          <p className="eyebrow">Your choices</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">How may we use your contribution?</h1>
          <p className="mt-4 text-ink-soft">
            Three separate choices. Only the first is needed to submit. Read the{" "}
            <Link href="/privacy/" target="_blank" className="underline hover:text-accent">
              privacy notice
            </Link>{" "}
            for how your information is stored, protected and removed.
          </p>

          <div className="mt-10 space-y-4">
            <Consent
              checked={consentResearch}
              onChange={setConsentResearch}
              title="Store and analyze my contribution"
              required
            >
              {CONSENT_TEXT.research}
            </Consent>
            <Consent checked={consentPublish} onChange={setConsentPublish} title="Publish an anonymized excerpt">
              {CONSENT_TEXT.publish}
            </Consent>
            <Consent checked={consentContact} onChange={setConsentContact} title="Contact me for a follow-up">
              {CONSENT_TEXT.contact}
            </Consent>
            {consentContact ? (
              <div className="grid gap-4 rounded-sm border border-rule bg-card p-5 sm:grid-cols-2">
                <Field label="Email">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    autoComplete="email"
                    className={inputClass}
                  />
                </Field>
                <Field label="Name or initials (optional)">
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    maxLength={LIMITS.shortField}
                    className={inputClass}
                  />
                </Field>
              </div>
            ) : null}
          </div>

          {/* Honeypot for automated spam; hidden from people and assistive tech. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-6 rounded-sm border border-accent/40 bg-accent-soft px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          <Nav>
            <button type="button" onClick={() => setStep("context")} className={secondaryButton}>
              Back
            </button>
            <button
              type="button"
              disabled={!consentResearch || submitting || (consentContact && !contactEmail.trim())}
              onClick={submit}
              className={primaryButton}
            >
              {submitting ? "Submitting…" : "Submit testimony"}
            </button>
          </Nav>
          <p className="mt-4 text-right text-xs text-muted">Consent version {CONSENT_VERSION}</p>
        </section>
      )}
    </div>
  );
}

function Done({ result }: { result: { participantCode: string; entryNumber: number } }) {
  const [copied, setCopied] = useState(false);
  const [remembered, setRemembered] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-16 sm:pt-24">
      <p className="eyebrow">Received</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Thank you. Your testimony is now part of the record.</h1>
      <p className="mt-6 leading-relaxed text-ink-soft">
        {result.entryNumber > 1
          ? `This is your ${ordinal(result.entryNumber)} contribution. Seeing how experiences change is what turns a collection of stories into a Living Memory.`
          : "Nothing is published automatically. If you allowed it, an editor may select an anonymized excerpt for the archive."}
      </p>

      <div className="mt-10 border border-ink bg-card p-6 sm:p-8">
        <p className="eyebrow">Your private participant code</p>
        <p className="mt-3 select-all break-all font-mono text-2xl tracking-wider sm:text-3xl">{result.participantCode}</p>
        <p className="mt-4 text-sm text-ink-soft">
          Keep this code if you&apos;d like to return in a few months and tell us how things have changed. It links your
          contributions without identifying you. We only store a one-way fingerprint of it, so we can&apos;t recover it
          for you.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              navigator.clipboard?.writeText(result.participantCode).then(() => setCopied(true));
            }}
          >
            {copied ? "Copied" : "Copy code"}
          </button>
          <button
            type="button"
            className={secondaryButton}
            disabled={remembered}
            onClick={() => {
              writeStorage(CODE_KEY, result.participantCode);
              setRemembered(true);
            }}
          >
            {remembered ? "Remembered on this device" : "Remember on this device"}
          </button>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-6 text-sm">
        <Link href="/archive/" className="border-b border-ink pb-0.5 hover:text-accent">
          Explore the archive →
        </Link>
        <Link href="/survey/" className="border-b border-ink pb-0.5 hover:text-accent">
          Take the survey too →
        </Link>
      </div>
    </div>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const inputClass =
  "w-full rounded-sm border border-rule bg-card px-3 py-2.5 text-base focus:border-ink focus:outline-none";
const primaryButton =
  "rounded-full bg-ink px-7 py-3 text-sm uppercase tracking-[0.14em] text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-ink/30";
const secondaryButton =
  "rounded-full border border-ink px-6 py-2.5 text-sm uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        selected ? "border-ink bg-ink text-paper" : "border-rule bg-card hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Consent({
  checked,
  onChange,
  title,
  required,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  required?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-4 rounded-sm border p-5 transition-colors ${
        checked ? "border-ink bg-card" : "border-rule hover:border-ink/50"
      }`}
    >
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 shrink-0 accent-ink" />
      <span>
        <span className="block font-medium">
          {title}
          <span className="ml-2 text-xs uppercase tracking-[0.12em] text-muted">{required ? "Required" : "Optional"}</span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{children}</span>
      </span>
    </label>
  );
}

function Nav({ children }: { children: ReactNode }) {
  return <div className="mt-12 flex items-center justify-between gap-4 border-t border-rule pt-6">{children}</div>;
}
