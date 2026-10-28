"use client";

import { CheckCircle2, ChevronDown, Database, Eye, Lightbulb, Mail, PenLine, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MediaPicker } from "./media-picker";
import { CircleLink } from "@/components/circle-link";
import { uploadData } from "aws-amplify/storage";
import { client, errorMessage, type WeeklyQuestion } from "@/lib/amplify";
import {
  AI_USE_FREQUENCIES,
  CONSENT_TEXT,
  CONSENT_VERSION,
  FEELINGS,
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
const STEPS: { id: Step; label: string; icon: LucideIcon }[] = [
  { id: "write", label: "Your story", icon: PenLine },
  { id: "context", label: "Context", icon: UserRound },
  { id: "consent", label: "Your choices", icon: ShieldCheck },
];

export function ShareFlow() {
  const params = useSearchParams();
  const weeklyId = params.get("weekly");

  const [step, setStep] = useState<Step>("write");
  const [weekly, setWeekly] = useState<WeeklyQuestion | null>(null);

  // Step 1
  const [text, setText] = useState("");
  const [promptId, setPromptId] = useState<string | null>(null);
  const promptsRef = useRef<HTMLDetailsElement>(null);
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
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ participantCode: string; entryNumber: number } | null>(null);

  // Restore browser-only state after hydration (the page is statically rendered).
  useEffect(() => {
    const draft = readStorage(DRAFT_KEY, session);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // Files are uploaded only now, after consent. The server checks them and
      // moves them somewhere only editors can read.
      const mediaKeys: string[] = [];
      for (const [i, file] of files.entries()) {
        setUploadStatus(`Uploading ${i + 1} of ${files.length}…`);
        const name = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-100) || "file";
        const { path } = await uploadData({
          path: `uploads/${crypto.randomUUID()}/${name}`,
          data: file,
          options: { contentType: file.type },
        }).result;
        mediaKeys.push(path);
      }
      setUploadStatus(files.length ? "Saving…" : null);
      const { data, errors } = await client.mutations.submitTestimony({
        text,
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
        mediaKeys,
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
      setUploadStatus(null);
    }
  }

  if (step === "done" && result) return <Done result={result} />;

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-12 sm:pt-16">
      <ol className="mb-12 flex items-center gap-2 text-sm" aria-label="Progress">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const reached = i <= stepIndex;
          return (
            <li key={s.id} aria-current={i === stepIndex ? "step" : undefined} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  reached ? "bg-accent text-card" : "bg-card text-muted ring-1 ring-rule"
                }`}
              >
                <Icon aria-hidden className="size-4" />
              </span>
              <span className={`hidden sm:inline ${reached ? "text-ink" : "text-muted"}`}>{s.label}</span>
              {i < STEPS.length - 1 ? <span aria-hidden className={`h-px flex-1 ${i < stepIndex ? "bg-accent" : "bg-rule"}`} /> : null}
            </li>
          );
        })}
      </ol>
      <p className="-mt-8 mb-8 text-sm text-muted sm:hidden">
        Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex].label}
      </p>

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
              <p className="mt-4 text-muted">Any language, any length. No right answers.</p>
              <details ref={promptsRef} className="group mt-8 rounded-lg bg-card ring-1 ring-rule">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm">
                  <Lightbulb aria-hidden className="size-5 text-accent" />
                  <span className="flex-1">Need a prompt?</span>
                  <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="space-y-1 px-3 pb-4">
                  {OPTIONAL_PROMPTS.map((p) => {
                    const selected = promptId === p.id;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setPromptId(selected ? null : p.id);
                            // Close the list once a prompt is chosen; it shows above the text box.
                            if (!selected && promptsRef.current) promptsRef.current.open = false;
                          }}
                          className={`w-full rounded px-3 py-2 text-left font-serif text-lg transition-colors ${
                            selected ? "bg-accent-soft text-ink" : "text-ink-soft hover:bg-paper"
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
              rows={8}
              maxLength={LIMITS.testimonyMax}
              placeholder="Start writing…"
              className="w-full resize-y rounded-lg border border-rule bg-card sm:min-h-80 px-5 py-4 font-serif text-lg leading-relaxed placeholder:text-muted/70 focus:border-ink focus:outline-none focus-visible:outline-none"
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

          <div className="mt-8">
            <MediaPicker files={files} onChange={setFiles} />
          </div>

          <div className="mt-8">
            <div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={returning}
                  onChange={(e) => setReturning(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-accent"
                />
                <span>
                  I have a participant code
                  <span className="block text-muted">Links this to your earlier stories.</span>
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
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">A little context</h1>
          <p className="mt-3 text-muted">All optional. No names.</p>

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
            <legend className="mb-3 text-sm font-medium">How do you feel about AI? (choose any)</legend>
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
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">How may we use it?</h1>
          <p className="mt-3 text-muted">
            Only the first is required.{" "}
            <Link href="/privacy/" target="_blank" className="underline hover:text-accent">
              Privacy notice
            </Link>
          </p>

          <div className="mt-10 space-y-4">
            <Consent
              checked={consentResearch}
              onChange={setConsentResearch}
              title="Store and analyze my contribution"
              icon={Database}
              required
            >
              {CONSENT_TEXT.research}
            </Consent>
            <Consent checked={consentPublish} onChange={setConsentPublish} title="Publish an anonymized excerpt" icon={Eye}>
              {CONSENT_TEXT.publish}
            </Consent>
            <Consent checked={consentContact} onChange={setConsentContact} title="Contact me for a follow-up" icon={Mail}>
              {CONSENT_TEXT.contact}
            </Consent>
            {consentContact ? (
              <div className="grid gap-4 rounded-lg bg-card p-5 ring-1 ring-rule sm:grid-cols-2">
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
              {submitting ? (uploadStatus ?? "Submitting…") : "Submit testimony"}
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
      <CheckCircle2 aria-hidden className="size-12 text-accent" strokeWidth={1.5} />
      <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">Thank you. It&apos;s part of the record now.</h1>
      <p className="mt-4 text-muted">
        {result.entryNumber > 1
          ? `Your ${ordinal(result.entryNumber)} contribution — linked to your earlier ones.`
          : "Nothing is published automatically."}
      </p>

      <div className="mt-10 rounded-lg bg-card p-6 shadow-sm ring-1 ring-rule sm:p-8">
        <p className="eyebrow">Your private participant code</p>
        <p className="mt-3 select-all break-all font-mono text-2xl tracking-wider sm:text-3xl">{result.participantCode}</p>
        <p className="mt-4 text-sm text-ink-soft">
          Come back in a few months with this code to tell us what changed. We can&apos;t recover it for you.
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
        <CircleLink href="/archive/">Explore the archive</CircleLink>
        <CircleLink href="/survey/">Take the survey too</CircleLink>
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
  "w-full rounded-md border border-rule bg-card px-3 py-2.5 text-base focus:border-ink focus:outline-none";
const primaryButton =
  "rounded-full bg-accent px-7 py-3 text-sm font-medium text-card transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/25";
const secondaryButton =
  "rounded-full px-6 py-2.5 text-sm font-medium ring-1 ring-ink transition-colors hover:bg-ink hover:text-card disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink";

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
        selected ? "border-navy bg-navy text-card" : "border-rule bg-card hover:border-ink"
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
  icon: Icon,
  required,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  icon: LucideIcon;
  required?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-4 rounded-lg bg-card p-5 ring-1 transition-shadow ${
        checked ? "shadow-sm ring-accent" : "ring-rule hover:ring-ink/40"
      }`}
    >
      <span
        className={`hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex ${
          checked ? "bg-accent text-card" : "bg-accent-soft text-accent"
        }`}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-medium">
          {title}
          <span className="ml-2 text-xs uppercase tracking-[0.12em] text-muted">{required ? "Required" : "Optional"}</span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{children}</span>
      </span>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0 accent-accent" />
    </label>
  );
}

function Nav({ children }: { children: ReactNode }) {
  return <div className="mt-12 flex items-center justify-between gap-4 border-t border-rule pt-6">{children}</div>;
}
