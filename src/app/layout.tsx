import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/providers/app-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Active Daily — ActivBank",
  description:
    "Банковский портал для управления продуктами, заявками и аналитикой",
  icons: {
    icon: "/logo.svg",
  },
  
};

import PortalLayout from "@/components/layout/PortalLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        <AppProvider>
          <PortalLayout>{children}</PortalLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
