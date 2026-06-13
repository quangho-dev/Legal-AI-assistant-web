import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trợ lý AI Pháp lý",
  description: "Trợ lý chat và nghiên cứu pháp lý được hỗ trợ bởi AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/sign-in"}>
      <html lang="vi" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-svh bg-background text-foreground antialiased`}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.17 0.032 255)",
                color: "oklch(0.94 0.015 255)",
                border: "1px solid oklch(0.32 0.04 255 / 45%)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
