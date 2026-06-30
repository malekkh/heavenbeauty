import type { Metadata } from "next";
import { Fraunces, Kanit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display face — a free, characterful serif standing in for the brand's
// proprietary "Mattone". Body face — Kanit, the font the live store uses.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

const kanit = Kanit({
  subsets: ["latin"],
  variable: "--font-kanit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Heaven Beauty — Where Tint Meets Radiance",
    template: "%s — Heaven Beauty",
  },
  description:
    "Effortless glow. A touch of color designed to enhance your natural beauty — soft, radiant, and effortlessly you.",
  openGraph: {
    title: "Heaven Beauty — Where Tint Meets Radiance",
    description:
      "A touch of color designed to enhance your natural glow — soft, radiant, and effortlessly you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
