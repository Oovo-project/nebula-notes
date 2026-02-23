import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/app/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-jp" });

export const metadata: Metadata = {
  title: "Nebula Notes",
  description: "声を、星に変える。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${notoSansJp.variable} bg-black text-[var(--text-main)]`}>
        <Providers>
          <div className="relative min-h-screen bg-black">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(138,180,248,0.08),rgba(0,0,0,0)_32%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col border-x border-[var(--line-soft)]">
              <Navbar />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
