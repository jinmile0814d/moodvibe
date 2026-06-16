import type { Metadata, Viewport } from "next";
import AudioProvider from "@/components/AudioProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodVibe - 每日氛围生成器",
  description: "输入城市和状态，生成专属于你的每日氛围",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
