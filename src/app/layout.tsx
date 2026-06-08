import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wqaihub.cn"),
  title: "AI电商利润增长系统",
  description: "核心功能重构中，敬请期待。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className="antialiased bg-[#09090b] text-white">
        <ToastProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
            <Navbar />
            <main className="pt-14">{children}</main>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
