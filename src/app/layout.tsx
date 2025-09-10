import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/providers/query-provider";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { ConditionalHeader } from "@/components/layout/conditional-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual Wellness",
  description: "Admin portal for clients and appointments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), Inter, "Noto Sans", sans-serif' }}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <ConditionalHeader />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </ReactQueryProvider>
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
