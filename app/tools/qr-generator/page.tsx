"use client";

import { useState, useRef, useEffect } from "react";
import { DownloadSimple, Copy } from "@phosphor-icons/react";

type ErrorLevel = "L" | "M" | "Q" | "H";

// Lightweight QR code using qrcodegen algorithm via canvas
// We'll use the qrcode-generator library approach
declare global {
  interface Window {
    qrcode?: (typeNumber: number, errorCorrectionLevel: string) => {
      addData: (data: string) => void;
      make: () => void;
      createImgTag: (cellSize?: number, margin?: number) => string;
      getModuleCount: () => number;
      isDark: (row: number, col: number) => boolean;
    };
  }
}

function drawQR(
  canvas: HTMLCanvasElement,
  text: string,
  size: number,
  fgColor: string,
  bgColor: string
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = size;
  canvas.height = size;

  // Simple manual QR-like pattern placeholder
  // In production: use 'qrcode' npm package
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // For a real QR, integrate the 'qrcode' package
  ctx.fillStyle = fgColor;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("QR requires", size / 2, size / 2 - 10);
  ctx.fillText("'qrcode' package", size / 2, size / 2 + 10);
}

// Use the qrcode npm package if installed
async function generateQR(
  text: string,
  size: number,
  fgColor: string,
  bgColor: string
): Promise<string> {
  try {
    // Dynamic import for qrcode package
    const QRCode = await import("qrcode").catch(() => null);
    if (QRCode) {
      const url = await QRCode.default.toDataURL(text, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
      });
      return url;
    }
  } catch {}

  // Fallback: simple canvas
  const canvas = document.createElement("canvas");
  drawQR(canvas, text, size, fgColor, bgColor);
  return canvas.toDataURL("image/png");
}

export default function QRGeneratorPage() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const generate = async (t = text, s = size, fg = fgColor, bg = bgColor) => {
    if (!t.trim()) return;
    setLoading(true);
    const url = await generateQR(t, s, fg, bg);
    setQrUrl(url);
    setLoading(false);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generate(), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, size, fgColor, bgColor]);

  const download = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const copyDataUrl = () => {
    navigator.clipboard.writeText(qrUrl);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        QR Code Generator
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Buat QR code dari URL, teks, nomor telepon, atau teks lainnya.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: controls */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
              Konten
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="URL, teks, atau nomor telepon..."
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text-1)",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
              Ukuran: {size}px
            </label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(+e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Warna QR
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "2px" }}
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
                  {fgColor.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Warna latar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "2px" }}
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
                  {bgColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full aspect-square rounded-xl flex items-center justify-center border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)", maxWidth: "256px" }}
          >
            {loading ? (
              <span className="text-sm" style={{ color: "var(--text-3)" }}>Generating...</span>
            ) : qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain p-3" />
            ) : (
              <span className="text-sm" style={{ color: "var(--text-3)" }}>Masukkan teks</span>
            )}
          </div>

          {qrUrl && (
            <div className="flex gap-2 w-full max-w-[256px]">
              <button
                onClick={download}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
                style={{ background: "var(--accent)", color: "white" }}
              >
                <DownloadSimple size={15} />
                Download
              </button>
              <button
                onClick={copyDataUrl}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
              >
                <Copy size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note about qrcode package */}
      <div
        className="mt-8 p-4 rounded-xl border text-xs"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-3)" }}
      >
        Untuk QR code nyata, install paket:{" "}
        <code
          className="px-1.5 py-0.5 rounded"
          style={{ background: "var(--surface-3)", color: "var(--accent-light)" }}
        >
          npm install qrcode
        </code>
      </div>
    </div>
  );
}
