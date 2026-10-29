"use client";

import { useState } from "react";
import { client, errorMessage } from "@/lib/amplify";

const input = "w-full rounded-md border border-rule bg-card px-3 py-2.5 text-base focus:border-ink focus:outline-none";

/** Lets anyone ask for their contribution to be removed, without an account. */
export function WithdrawalForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setState("sending");
    setError(null);
    try {
      const { data, errors } = await client.mutations.requestWithdrawal({
        message,
        participantCode: code || undefined,
        replyEmail: replyEmail || undefined,
      });
      if (!data) throw new Error(errorMessage(errors, "Something went wrong. Please try again."));
      setState("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="rounded-lg bg-ok/10 px-5 py-4 text-ok">
        Request received. An editor will remove the contribution and, if you left an email, confirm when it&apos;s done.
      </p>
    );
  }

  return (
    <div className="grid gap-4 rounded-lg bg-card p-6 ring-1 ring-rule sm:grid-cols-2 sm:p-8">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Participant code (if you have it)</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="HARF-XXXX-XXXX-XXXX"
          className={`${input} font-mono uppercase`}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Email for our reply (optional)</span>
        <input type="email" value={replyEmail} onChange={(e) => setReplyEmail(e.target.value)} className={input} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm font-medium">Which contribution should we remove?</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Roughly when you shared it and what it was about, or “everything linked to my code”."
          className={input}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-accent sm:col-span-2">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="button"
          onClick={send}
          disabled={message.trim().length < 5 || state === "sending"}
          className="min-h-10 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-card transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          {state === "sending" ? "Sending…" : "Request removal"}
        </button>
      </div>
    </div>
  );
}
