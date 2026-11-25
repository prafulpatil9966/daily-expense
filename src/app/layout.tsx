import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Pocket | Personal Expenses",
  description: "A personal daily expense dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={dmSans.variable}><AppShell>{children}</AppShell></body>
    </html>
  );
}
