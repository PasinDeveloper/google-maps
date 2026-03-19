import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

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
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen bg-slate-100 font-sans text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
