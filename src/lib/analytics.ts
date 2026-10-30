"use client";

import { client } from "./amplify";
import type { AnalyticsEventName } from "./harf";

const VISITOR_KEY = "harf.visitor";

/** Honour Do Not Track / Global Privacy Control: send nothing at all. */
function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

/** A random, anonymous ID kept in this browser so returning visits can be counted. */
function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function externalReferrer() {
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : "";
    return host && host !== location.hostname ? host : undefined;
  } catch {
    return undefined;
  }
}

/** Fire-and-forget usage event. Never throws, never blocks the page. */
export function track(name: AnalyticsEventName, from?: string) {
  if (typeof window === "undefined" || optedOut()) return;
  client.mutations
    .track({
      name,
      from,
      path: location.pathname,
      referrer: name === "page_view" ? externalReferrer() : undefined,
      device: matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
      visitorId: visitorId(),
    })
    .catch(() => undefined);
}
