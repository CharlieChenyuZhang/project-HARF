"use client";

import { Film, ImagePlus, Music, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MEDIA, isAllowedMediaType } from "@/lib/harf";

const MAX_MB = MEDIA.maxBytes / 1024 / 1024;

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Lets people attach images, audio or video. Files stay in the browser until
 * the testimony is submitted, so nothing is stored before consent is given.
 */
export function MediaPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files],
  );
  useEffect(() => () => previews.forEach((url) => url && URL.revokeObjectURL(url)), [previews]);

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const problems: string[] = [];
    for (const file of Array.from(list)) {
      if (next.length >= MEDIA.maxFiles) {
        problems.push(`You can attach up to ${MEDIA.maxFiles} files.`);
        break;
      }
      if (!isAllowedMediaType(file.type)) problems.push(`${file.name}: only images, audio and video.`);
      else if (file.size > MEDIA.maxBytes) problems.push(`${file.name}: larger than ${MAX_MB} MB.`);
      else if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file);
    }
    setError(problems.length ? problems.join(" ") : null);
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-lg border border-dashed px-5 py-6 text-center transition-colors sm:flex-row sm:text-left ${
          dragging ? "border-accent bg-accent-soft" : "border-rule bg-card"
        }`}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <ImagePlus aria-hidden className="size-5" />
        </span>
        <span className="flex-1 text-sm">
          <span className="block font-medium">Add images, audio or video (optional)</span>
          <span className="block text-muted">
            Up to {MEDIA.maxFiles} files, {MAX_MB} MB each. Avoid faces or names that could identify you or others.
          </span>
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= MEDIA.maxFiles}
          className="min-h-10 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-ink transition-colors hover:bg-ink hover:text-card disabled:opacity-40"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MEDIA.types.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      ) : null}

      {files.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, i) => {
            const Icon = file.type.startsWith("video/") ? Film : Music;
            return (
              <li key={`${file.name}-${file.size}`} className="relative overflow-hidden rounded-lg bg-card ring-1 ring-rule">
                {previews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                  <img src={previews[i]!} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <span className="flex aspect-[4/3] items-center justify-center bg-paper text-muted">
                    <Icon aria-hidden className="size-8" strokeWidth={1.5} />
                  </span>
                )}
                <span className="block truncate px-3 pt-2 text-xs font-medium">{file.name}</span>
                <span className="block px-3 pb-2 text-xs text-muted">{formatSize(file.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-ink/70 text-card hover:bg-accent"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
