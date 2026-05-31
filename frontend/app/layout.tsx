import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrivacyShield AI - Privacy-First Surveillance",
  description:
    "AI-powered CCTV surveillance with automatic face blurring. Protect the public, not profile the public.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(11, 14, 26, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "#E2E8F0",
                backdropFilter: "blur(16px)",
                fontSize: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
