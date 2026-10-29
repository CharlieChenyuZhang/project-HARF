"use client";

import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import "@/lib/amplify";
import { AnalyticsPanel } from "./analytics-panel";
import { ExportPanel } from "./export-panel";
import { RequestsPanel } from "./requests-panel";
import { TestimonyReview } from "./testimony-review";
import { WeeklyQuestions } from "./weekly-questions";

const TABS = [
  { id: "review", label: "Testimonies" },
  { id: "weekly", label: "Question of the Week" },
  { id: "requests", label: "Withdrawal requests" },
  { id: "analytics", label: "Analytics" },
  { id: "export", label: "Export" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AdminApp() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10">
      <Authenticator hideSignUp>
        {({ signOut, user }) => <Dashboard email={user?.signInDetails?.loginId} signOut={signOut} />}
      </Authenticator>
    </div>
  );
}

function Dashboard({ email, signOut }: { email?: string; signOut?: () => void }) {
  const [isEditor, setIsEditor] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("review");

  useEffect(() => {
    fetchAuthSession().then((s) => {
      const groups = (s.tokens?.accessToken.payload["cognito:groups"] as string[] | undefined) ?? [];
      setIsEditor(groups.includes("ADMINS"));
    });
  }, []);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
        <div>
          <p className="eyebrow">Editorial dashboard</p>
          <h1 className="mt-2 font-serif text-3xl">The Living Memory</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{email}</span>
          <button type="button" onClick={signOut} className="underline hover:text-accent">
            Sign out
          </button>
        </div>
      </header>

      {isEditor === false ? (
        <p className="mt-10 text-ink-soft">
          This account is not in the editors group. Ask a HARF administrator to add it to <code>ADMINS</code>.
        </p>
      ) : isEditor ? (
        <>
          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`border-b-2 pb-2 ${tab === t.id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="mt-8">
            {tab === "review" && <TestimonyReview />}
            {tab === "weekly" && <WeeklyQuestions />}
            {tab === "requests" && <RequestsPanel />}
            {tab === "analytics" && <AnalyticsPanel />}
            {tab === "export" && <ExportPanel />}
          </div>
        </>
      ) : null}
    </div>
  );
}
