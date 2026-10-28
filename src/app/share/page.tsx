import type { Metadata } from "next";
import { Suspense } from "react";
import { ShareFlow } from "./share-flow";

export const metadata: Metadata = {
  title: "Share your experience",
  description: "Tell HARF what is happening in your relationship with AI, in your own words.",
};

export default function SharePage() {
  return (
    <Suspense>
      <ShareFlow />
    </Suspense>
  );
}
