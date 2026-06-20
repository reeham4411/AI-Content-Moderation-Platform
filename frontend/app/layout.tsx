import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Muhafiz — AI Content Moderation Platform",
  description:
    "Automate image moderation, reduce manual review workload, and keep policy enforcement transparent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jbMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
