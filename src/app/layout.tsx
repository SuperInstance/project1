import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Brain, Home, Mic, Settings, Plus } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Podcast Maker - Cognitive AI-Native",
  description: "Create podcasts with Cognitive AI that understands, remembers, learns, and evolves to provide perfectly personalized podcast creation experience.",
  keywords: ["Podcast", "Cognitive AI", "Artificial Intelligence", "Voice", "Audio", "TTS", "ASR", "Personalization"],
  authors: [{ name: "Podcast Maker Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Podcast Maker - Cognitive AI-Native",
    description: "Create podcasts with Cognitive AI that understands, remembers, learns, and evolves.",
    url: "https://podcast-maker.ai",
    siteName: "Podcast Maker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Maker - Cognitive AI",
    description: "Create podcasts with Cognitive AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Cognitive AI Header Badge */}
        <div className="border-b bg-primary/5 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Mic className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Podcast Maker</span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/cognitive" className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  <Brain className="h-4 w-4" />
                  <span>Cognitive AI</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {children}

        {/* Toaster */}
        <Toaster />
      </body>
    </html>
  );
}
