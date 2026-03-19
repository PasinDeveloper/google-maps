import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Google Maps Next.js Demo",
  description:
    "A demo of Google Maps integration with Next.js 15, featuring custom HTML markers, clustering, and two-way panel sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
