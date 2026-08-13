"use client";

import { useState } from "react";
import { Copy, CheckCircle } from "@phosphor-icons/react";

type Tab = "case" | "count" | "clean";

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return { copied, copy };
}

function CopyBtn({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      onClick={() => copy(text)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
      style={{ background: "var(--surface-3)", color: "var(--text-2)" }}
    >
      {copied ? <CheckCircle size={14} color="#10b981" weight="fill" /> : <Copy size={14} />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

export default function TextToolsPage() {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>("case");

  const word = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
  const char = input.length;
  const charNoSpace = input.replace(/\s/g, "").length;
  const lines = input === "" ? 0 : input.split("\n").length;
  const sentences = input.split(/[.!?]+/).filter((s) => s.trim()).length;
  const readingMin = Math.max(1, Math.ceil(word / 200));

  const toUpper = input.toUpperCase();
  const toLower = input.toLowerCase();
  const toTitle = input.replace(/\b\w/g, (c) => c.toUpperCase());
  const toSentence = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  const toCamel = input
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
  const toSnake = input.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const toKebab = input.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const trimmed = input.split("\n").map((l) => l.trim()).join("\n");
  const noExtraSpaces = input.replace(/\s+/g, " ").trim();
  const noBlankLines = input.replace(/\n\s*\n/g, "\n").trim();
  const reversed = input.split("").reverse().join("");

  const tabs: { id: Tab; label: string }[] = [
    { id: "case", label: "Konversi Case" },
    { id: "count", label: "Statistik" },
    { id: "clean", label: "Bersihkan" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Alat Teks
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
        Word count, konversi case, dan bersihkan teks.
      </p>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik atau paste teks di sini..."
        rows={6}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none mb-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-1)",
          fontFamily: "var(--font-mono)",
        }}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--surface-3)" : "transparent",
              color: tab === t.id ? "var(--text-1)" : "var(--text-3)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "count" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Kata", value: word },
            { label: "Karakter", value: char },
            { label: "Karakter (tanpa spasi)", value: charNoSpace },
            { label: "Baris", value: lines },
            { label: "Kalimat", value: sentences },
            { label: "Menit baca", value: `~${readingMin} menit` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "case" && (
        <div className="flex flex-col gap-2">
          {[
            { label: "HURUF BESAR", value: toUpper },
            { label: "huruf kecil", value: toLower },
            { label: "Title Case", value: toTitle },
            { label: "Sentence case", value: toSentence },
            { label: "camelCase", value: toCamel },
            { label: "snake_case", value: toSnake },
            { label: "kebab-case", value: toKebab },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-3)" }}>
                  {item.label}
                </p>
                <p className="text-sm truncate" style={{ color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                  {item.value || <span style={{ color: "var(--text-3)" }}>—</span>}
                </p>
              </div>
              <CopyBtn text={item.value} />
            </div>
          ))}
        </div>
      )}

      {tab === "clean" && (
        <div className="flex flex-col gap-2">
          {[
            { label: "Trim spasi per baris", value: trimmed },
            { label: "Hapus spasi berlebih", value: noExtraSpaces },
            { label: "Hapus baris kosong", value: noBlankLines },
            { label: "Balik teks", value: reversed },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-3)" }}>
                  {item.label}
                </p>
                <p
                  className="text-sm line-clamp-3 whitespace-pre-wrap"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}
                >
                  {item.value || <span style={{ color: "var(--text-3)" }}>—</span>}
                </p>
              </div>
              <CopyBtn text={item.value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
