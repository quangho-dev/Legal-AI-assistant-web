import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "vietnamese"],
  display: "swap",
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
          className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} min-h-svh bg-background font-sans text-foreground antialiased`}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.15 0.045 222)",
                color: "oklch(0.93 0.022 220)",
                border: "1px solid oklch(0.30 0.058 215 / 42%)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
