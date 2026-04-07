import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/Navbar";
import RouteTransition from "@/components/RouteTransition";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIGC 工具宇宙导航",
  description: "宇宙星空科技风 AIGC 工具导航站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-50">
        <Providers>
          <div className="relative min-h-screen">
            <ParticleBackground />
            <Navbar />
            <main className="relative z-10">
              <RouteTransition>{children}</RouteTransition>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
