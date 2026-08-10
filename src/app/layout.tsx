import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Instrument_Serif, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import BallpitBackground from "@/components/ballpit/BallpitBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "胡睿涵 · 一个用 AI 做出东西的小学生",
  description: "胡睿涵的个人站。12 岁，喜欢用 AI 编程做能帮助学习和生活的应用。",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jakarta.variable} ${serif.variable} ${notoSC.variable}`}
    >
      <body className="bg-bg text-text font-sans antialiased min-h-screen relative overflow-x-hidden">
        <BallpitBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}