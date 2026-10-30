"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/harf";

/** Page views on every route, plus clicks on anything marked data-track="event". */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/admin")) track("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track as AnalyticsEventName | undefined;
      if (name && (ANALYTICS_EVENTS as readonly string[]).includes(name)) track(name, el?.dataset.trackFrom);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
