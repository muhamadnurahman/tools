"use client";

import { useState, useEffect, useRef } from "react";
import { DownloadSimple } from "@phosphor-icons/react";

type BarcodeType = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39" | "ITF14";

export default function BarcodeGeneratorPage() {
  const [text, setText] = useState("123456789");
  const [type, setType] = useState<BarcodeType>("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [fgColor, setFgColor] = useState("#000000");
  const [error, setError] = useState("");
  const svgRef = useRef<HTMLDivElement>(null);

  const types: { value: BarcodeType; label: string; hint: string }[] = [
    { value: "CODE128", label: "Code 128", hint: "Teks & angka" },
    { value: "EAN13", label: "EAN-13", hint: "13 digit angka" },
    { value: "EAN8", label: "EAN-8", hint: "8 digit angka" },
    { value: "UPC", label: "UPC-A", hint: "12 digit angka" },
    { value: "CODE39", label: "Code 39", hint: "Huruf besar & angka" },
    { value: "ITF14", label: "ITF-14", hint: "14 digit angka" },
  ];

  useEffect(() => {
    const gen = async () => {
      if (!svgRef.current || !text.trim()) return;
      try {
        const JsBarcode = (await import("jsbarcode").catch(() => null))?.default;
        if (!JsBarcode) {
          setError("Paket jsbarcode belum terinstall. Jalankan: npm install jsbarcode");
          return;
        }
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, text, {
          format: type,
          width,
          height,
          lineColor: fgColor,
          background: "transparent",
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
        svgRef.current.innerHTML = "";
        svgRef.current.appendChild(svg);
        setError("");
      } catch (e) {
        setError(`Input tidak valid untuk format ${type}.`);
        if (svgRef.current) svgRef.current.innerHTML = "";
      }
    };
    gen();
  }, [text, type, width, height, fgColor]);

  const download = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${type}.svg`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Barcode Generator
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Generate berbagai jenis barcode: Code 128, EAN, UPC, dan lainnya.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Barcode type */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
              Jenis barcode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="p-2 rounded-lg border text-left transition-all"
                  style={{
                    background: type === t.value ? "var(--accent)" + "20" : "var(--surface)",
                    borderColor: type === t.value ? "var(--accent)" + "50" : "var(--border)",
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: type === t.value ? "var(--accent)" : "var(--text-1)" }}>
                    {t.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                    {t.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
              Konten
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
              style={{
                background: "var(--surface)",
                borderColor: error ? "#ef4444" : "var(--border)",
                color: "var(--text-1)",
              }}
            />
            {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Lebar bar: {width}
              </label>
              <input
                type="range" min={1} max={5} value={width}
                onChange={(e) => setWidth(+e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Tinggi: {height}px
              </label>
              <input
                type="range" min={40} max={200} step={10} value={height}
                onChange={(e) => setHeight(+e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
              Warna
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "2px" }}
              />
              <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>{fgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>Preview</p>
          <div
            className="flex-1 rounded-xl border flex items-center justify-center p-4 min-h-[180px]"
            style={{ background: "white", borderColor: "var(--border)" }}
          >
            <div ref={svgRef} />
          </div>
          <button
            onClick={download}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <DownloadSimple size={15} />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}
