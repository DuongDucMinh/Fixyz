import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Fixyz - QA Bug Tracker",
  description: "Modern QA Bug Tracker web application inspired by Figma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`h-full m-0 p-0 ${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-full m-0 p-0 bg-[#F8F9FF] text-[#0B1C30] antialiased selection:bg-brand-100 selection:text-brand-700">
        {children}
      </body>
    </html>
  );
}

