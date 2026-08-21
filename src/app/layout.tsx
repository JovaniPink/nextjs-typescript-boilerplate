import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Next.js TypeScript Boilerplate",
    template: "%s | Next.js TypeScript Boilerplate",
  },
  description:
    "A production-minded Next.js and TypeScript starter with the quality bar built in.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f1e8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
