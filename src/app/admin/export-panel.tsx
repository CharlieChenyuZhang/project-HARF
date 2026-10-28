"use client";

import { useState } from "react";
import { client, listAll } from "@/lib/amplify";
import { Notice, secondaryButton } from "./ui";

const auth = { authMode: "userPool" } as const;

type Row = Record<string, unknown>;

function toCsv(rows: Row[]) {
  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v: unknown) => {
    if (v == null) return "";
    const s = Array.isArray(v)
      ? v.filter((x) => x != null).map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join("; ")
      : typeof v === "object"
        ? JSON.stringify(v)
        : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\r\n");
}

function download(filename: string, content: string, type: string) {
  // BOM so spreadsheet apps read non-English testimonies as UTF-8.
  const blob = new Blob([type === "text/csv" ? "﻿" : "", content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");

const DATASETS = {
  testimonies: {
    label: "Testimonies",
    description: "Original text, context, consent, editorial status, themes and attachment keys. No contact details.",
    fetch: () => listAll((nextToken) => client.models.Testimony.list({ ...auth, nextToken, limit: 500 })),
  },
  excerpts: {
    label: "Published excerpts",
    description: "Everything currently visible in the public archive.",
    fetch: () => listAll((nextToken) => client.models.Excerpt.list({ ...auth, nextToken, limit: 500 })),
  },
  contacts: {
    label: "Follow-up contacts",
    description: "Kept apart from testimonies. Personal data: store and share with care.",
    fetch: () => listAll((nextToken) => client.models.Contact.list({ ...auth, nextToken, limit: 500 })),
  },
} as const;

export function ExportPanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function run(key: keyof typeof DATASETS, format: "csv" | "json") {
    setBusy(`${key}.${format}`);
    setMessage(null);
    try {
      const rows = (await DATASETS[key].fetch()) as unknown as Row[];
      const name = `harf-${key}-${stamp()}.${format}`;
      if (format === "json") download(name, JSON.stringify(rows, null, 2), "application/json");
      else download(name, toCsv(rows), "text/csv");
      setMessage({ kind: "ok", text: `Exported ${rows.length} records to ${name}.` });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Export failed." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-ink-soft">
        Exports contain confidential research data. Store them in an access-controlled location.
      </p>
      <ul className="divide-y divide-rule border-y border-rule">
        {(Object.keys(DATASETS) as (keyof typeof DATASETS)[]).map((key) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="font-serif text-xl">{DATASETS[key].label}</p>
              <p className="mt-1 text-sm text-muted">{DATASETS[key].description}</p>
            </div>
            <div className="flex gap-2">
              {(["csv", "json"] as const).map((format) => (
                <button key={format} type="button" disabled={!!busy} onClick={() => run(key, format)} className={secondaryButton}>
                  {busy === `${key}.${format}` ? "…" : format.toUpperCase()}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {message ? <Notice kind={message.kind}>{message.text}</Notice> : null}
    </div>
  );
}
