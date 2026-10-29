import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Newsreader } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { PreviewBanner, SiteFooter, SiteHeader } from "@/components/site-chrome";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HARF — Human Agency, Reasoning & Futures",
    template: "%s · HARF",
  },
  description:
    "Documenting how artificial intelligence is reshaping the way we think, learn, work, and relate to one another — as the transformation unfolds.",
};

export const viewport: Viewport = {
  themeColor: "#1b2136",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <PreviewBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Suspense>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
