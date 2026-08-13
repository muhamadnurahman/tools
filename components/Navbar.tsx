"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { List, X, Wrench } from "@phosphor-icons/react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg" style={{ color: "var(--text-1)" }}>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "var(--accent)" }}>
            <Wrench size={16} weight="bold" color="white" />
          </span>
          ToolKit
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                color: pathname === l.href ? "var(--text-1)" : "var(--text-2)",
                background: pathname === l.href ? "var(--surface-2)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "var(--text-2)" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ color: "var(--text-2)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/tools/image-converter", label: "Gambar" },
  { href: "/tools/video-downloader", label: "Video & Musik" },
  { href: "/tools/remove-bg", label: "Remove BG" },
  { href: "/tools/text-tools", label: "Teks" },
  { href: "/tools/color-picker", label: "Warna" },
];
