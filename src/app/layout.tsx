import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wqaihub.cn"),
  title: "AI电商利润增长系统 | 上传Excel自动生成投流优化建议",
  description: "上传抖音、千川、直播数据Excel，AI自动识别亏钱计划，发现高ROI机会，生成加投、减投、暂停建议，帮助电商商家提升利润和ROI。",
  openGraph: {
    title: "AI电商利润增长系统",
    description: "上传Excel，AI直接告诉你怎么赚钱。自动识别亏钱计划，发现高ROI机会。",
    url: "https://wqaihub.cn",
    siteName: "AI电商利润增长系统",
    type: "website",
  },
  alternates: {
    canonical: "https://wqaihub.cn",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-white`}>
        <ToastProvider><ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider></ToastProvider>
      </body>
    </html>
  );
}