"use client";

import { Download } from "lucide-react";
import { getUrl } from "aws-amplify/storage";
import { useEffect, useState } from "react";
import type { Testimony } from "@/lib/amplify";

type Media = NonNullable<NonNullable<Testimony["media"]>[number]>;

/** Attached media, read through short-lived signed URLs (editors only). */
export function MediaGallery({ media }: { media: Media[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all(
      media.map(async (m) => [m.key, (await getUrl({ path: m.key, options: { expiresIn: 900 } })).url.toString()] as const),
    )
      .then((pairs) => setUrls(Object.fromEntries(pairs)))
      .catch(() => setFailed(true));
  }, [media]);

  if (failed) return <p className="text-sm text-accent">Couldn&apos;t load the attachments.</p>;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {media.map((m) => {
        const url = urls[m.key];
        const type = m.contentType ?? "";
        return (
          <li key={m.key} className="overflow-hidden rounded-lg bg-card ring-1 ring-rule">
            {!url ? (
              <div className="aspect-[4/3] animate-pulse bg-paper" />
            ) : type.startsWith("image/") ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed S3 URL */}
                <img src={url} alt={m.name ?? "Attachment"} className="aspect-[4/3] w-full object-cover" />
              </a>
            ) : type.startsWith("video/") ? (
              <video src={url} controls preload="metadata" className="aspect-[4/3] w-full bg-ink" />
            ) : (
              <div className="p-3">
                <audio src={url} controls preload="metadata" className="w-full" />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted">
              <span className="truncate">{m.name}</span>
              {url ? (
                <a href={url} download={m.name ?? undefined} aria-label={`Download ${m.name}`} className="p-1 hover:text-accent">
                  <Download aria-hidden className="size-4" />
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
