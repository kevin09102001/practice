import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

// Serif editorial para titulares
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Practice — Rehearse before it counts",
    template: "%s · Practice",
  },
  description:
    "Practice high-stakes conversations with an AI that talks back. Job interviews, salary negotiations, hard talks — until they feel easy.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "Practice — Rehearse before it counts",
    description:
      "Practice high-stakes conversations with an AI. Until they feel easy.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="grain antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="light"
          toastOptions={{
            style: {
              background: "var(--color-paper)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
