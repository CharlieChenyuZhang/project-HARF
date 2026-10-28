import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
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
    "A living record of how people experience and adapt to artificial intelligence. Share your experience, take the survey, or explore the archive.",
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <PreviewBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
