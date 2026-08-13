"use client";

import { useState } from "react";
import { Copy, CheckCircle } from "@phosphor-icons/react";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
      case gg: h = ((bb - rr) / d + 2) / 6; break;
      case bb: h = ((rr - gg) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState("");
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  };
  return { copiedKey, copy };
}

const SWATCHES = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#06b6d4", "#6366f1", "#a855f7",
  "#ec4899", "#f1f5f9", "#334155", "#0f172a",
];

export default function ColorPickerPage() {
  const [color, setColor] = useState("#6366f1");
  const { copiedKey, copy } = useCopy();

  const { r, g, b } = hexToRgb(color);
  const { h, s, l } = rgbToHsl(r, g, b);
  const { h: hh, s: sv, v } = hexToHsv(color);

  const formats = [
    { key: "hex", label: "HEX", value: color.toUpperCase() },
    { key: "rgb", label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
    { key: "rgba", label: "RGBA", value: `rgba(${r}, ${g}, ${b}, 1)` },
    { key: "hsl", label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
    { key: "hsv", label: "HSV", value: `hsv(${hh}, ${sv}%, ${v}%)` },
    { key: "css", label: "CSS var", value: `--color: ${color};` },
    { key: "tailwind", label: "Tailwind (approx)", value: `[${color}]` },
  ];

  // Generate tints/shades
  const tints = [90, 70, 50, 30, 10].map((l) => `hsl(${h}, ${s}%, ${l}%)`);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Color Picker
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Pilih warna dan konversi antara HEX, RGB, HSL, dan format lainnya.
      </p>

      {/* Main picker */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-20 rounded-2xl border cursor-pointer"
            style={{ borderColor: "var(--border)", padding: "2px", background: "var(--surface)" }}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v.length < 7 ? v : v);
            }}
            className="w-full px-4 py-3 rounded-xl border text-base font-mono outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-1)",
            }}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
            rgb({r}, {g}, {b}) &nbsp;|&nbsp; hsl({h}, {s}%, {l}%)
          </p>
        </div>
      </div>

      {/* Swatches */}
      <div className="mb-6">
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-3)" }}>Warna populer</p>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-lg border-2 transition-all"
              style={{
                background: c,
                borderColor: color === c ? "var(--text-1)" : "transparent",
              }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Tints */}
      <div className="mb-6">
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-3)" }}>Tints & Shades</p>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {tints.map((t, i) => (
            <div
              key={i}
              className="flex-1 h-12 cursor-pointer transition-transform hover:scale-y-110"
              style={{ background: t }}
              onClick={() => {
                const tmp = document.createElement("canvas");
                tmp.width = 1; tmp.height = 1;
                const ctx = tmp.getContext("2d")!;
                ctx.fillStyle = t;
                ctx.fillRect(0, 0, 1, 1);
                const [rr, gg, bb] = ctx.getImageData(0, 0, 1, 1).data;
                const hex = "#" + [rr, gg, bb].map((v) => v.toString(16).padStart(2, "0")).join("");
                setColor(hex);
              }}
              title={t}
            />
          ))}
        </div>
      </div>

      {/* Format list */}
      <div className="flex flex-col gap-2">
        {formats.map((f) => (
          <div
            key={f.key}
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-xs font-medium w-24 flex-shrink-0" style={{ color: "var(--text-3)" }}>
              {f.label}
            </span>
            <span
              className="flex-1 text-sm font-mono truncate"
              style={{ color: "var(--text-1)" }}
            >
              {f.value}
            </span>
            <button
              onClick={() => copy(f.value, f.key)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs flex-shrink-0"
              style={{ background: "var(--surface-3)", color: "var(--text-2)" }}
            >
              {copiedKey === f.key ? (
                <CheckCircle size={13} color="#10b981" weight="fill" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
