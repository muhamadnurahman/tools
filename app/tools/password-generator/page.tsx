"use client";

import { useState } from "react";
import { Copy, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbig, setExcludeAmbig] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);

  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const DIGITS = "0123456789";
  const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const AMBIG = "Il1O0";

  const buildCharset = () => {
    let chars = "";
    if (useUpper) chars += UPPER;
    if (useLower) chars += LOWER;
    if (useDigits) chars += DIGITS;
    if (useSymbols) chars += SYMBOLS;
    if (excludeAmbig) chars = chars.split("").filter((c) => !AMBIG.includes(c)).join("");
    return chars;
  };

  const generate = () => {
    const charset = buildCharset();
    if (!charset) return;
    const arr = new Array(count).fill(0).map(() => {
      const rand = new Uint32Array(length);
      crypto.getRandomValues(rand);
      return Array.from(rand).map((v) => charset[v % charset.length]).join("");
    });
    setPassword(arr[0]);
    setPasswords(arr);
    setCopied(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 20) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { label: "Lemah", color: "#ef4444", pct: 33 };
    if (score <= 4) return { label: "Sedang", color: "#f59e0b", pct: 66 };
    return { label: "Kuat", color: "#10b981", pct: 100 };
  })();

  const Option = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-2)" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Password Generator
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Buat password kuat dan aman secara acak.
      </p>

      {/* Settings */}
      <div
        className="p-5 rounded-xl border mb-6 flex flex-col gap-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
            Panjang: {length}
          </label>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(+e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Option label="Huruf besar (A-Z)" checked={useUpper} onChange={setUseUpper} />
          <Option label="Huruf kecil (a-z)" checked={useLower} onChange={setUseLower} />
          <Option label="Angka (0-9)" checked={useDigits} onChange={setUseDigits} />
          <Option label="Simbol (!@#...)" checked={useSymbols} onChange={setUseSymbols} />
          <Option label="Hindari karakter mirip" checked={excludeAmbig} onChange={setExcludeAmbig} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
            Jumlah password: {count}
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(+e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={generate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm mb-6"
        style={{ background: "var(--accent)", color: "white" }}
      >
        <ArrowsClockwise size={15} />
        Generate Password
      </button>

      {passwords.length > 0 && (
        <>
          {/* Strength meter */}
          {strength && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "var(--text-3)" }}>Kekuatan</span>
                <span className="text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${strength.pct}%`, background: strength.color }}
                />
              </div>
            </div>
          )}

          {/* Password list */}
          <div className="flex flex-col gap-2 mb-4">
            {passwords.map((pw, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span
                  className="flex-1 text-sm break-all"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-mono)" }}
                >
                  {pw}
                </span>
                <button
                  onClick={() => { navigator.clipboard.writeText(pw); }}
                  style={{ color: "var(--text-3)", flexShrink: 0 }}
                >
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>

          {passwords.length > 1 && (
            <button
              onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              {copied ? <CheckCircle size={15} color="#10b981" weight="fill" /> : <Copy size={15} />}
              Salin semua
            </button>
          )}
        </>
      )}
    </div>
  );
}
