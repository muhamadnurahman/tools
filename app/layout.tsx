import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolKit — Semua Tools dalam Satu Tempat",
  description:
    "Convert gambar, resize foto, download video & musik, hapus background, dan banyak tools gratis lainnya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
          <p>ToolKit &copy; {new Date().getFullYear()} &mdash; Tools gratis untuk semua orang</p>
        </footer>
      </body>
    </html>
  );
}
