"use client";

import { useEffect, useState } from "react";
import { client, listAll } from "@/lib/amplify";
import type { Schema } from "../../../amplify/data/resource";
import { Badge, Notice, secondaryButton } from "./ui";

const auth = { authMode: "userPool" } as const;
type Request = Schema["WithdrawalRequest"]["type"];

async function fetchRequests() {
  const all = await listAll((nextToken) => client.models.WithdrawalRequest.list({ ...auth, nextToken }));
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Removal requests from the privacy page. Delete the testimony from the Testimonies tab, then mark done. */
export function RequestsPanel() {
  const [items, setItems] = useState<Request[] | null>(null);
  const [matches, setMatches] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests()
      .then(async (requests) => {
        setItems(requests);
        const counts: Record<string, number> = {};
        for (const r of requests) {
          if (!r.participantRef) continue;
          const { data } = await client.models.Testimony.listTestimoniesByParticipant(
            { participantRef: r.participantRef },
            auth,
          );
          counts[r.id] = data.length;
        }
        setMatches(counts);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load requests."));
  }, []);

  async function toggle(r: Request) {
    const { data } = await client.models.WithdrawalRequest.update({ id: r.id, resolved: !r.resolved }, auth);
    if (data) setItems((prev) => prev?.map((x) => (x.id === r.id ? data : x)) ?? null);
  }

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!items) return <p className="text-muted">Loading requests…</p>;
  if (!items.length) return <p className="text-muted">No withdrawal requests.</p>;

  return (
    <ul className="max-w-3xl divide-y divide-rule border-y border-rule">
      {items.map((r) => (
        <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
          <div className="max-w-xl">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {new Date(r.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              {r.resolved ? <Badge tone="ok">Done</Badge> : <Badge tone="accent">Open</Badge>}
              {r.participantRef ? (
                <Badge>
                  Code given · {matches[r.id] ?? "…"} matching {matches[r.id] === 1 ? "testimony" : "testimonies"}
                </Badge>
              ) : (
                <Badge>No code</Badge>
              )}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{r.message}</p>
            {r.replyEmail ? (
              <a href={`mailto:${r.replyEmail}`} className="mt-1 inline-block text-sm underline">
                {r.replyEmail}
              </a>
            ) : null}
          </div>
          <button type="button" onClick={() => toggle(r)} className={secondaryButton}>
            {r.resolved ? "Reopen" : "Mark done"}
          </button>
        </li>
      ))}
    </ul>
  );
}
