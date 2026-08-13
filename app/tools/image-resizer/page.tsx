"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, X } from "@phosphor-icons/react";

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepRatio, setKeepRatio] = useState(true);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [outputUrl, setOutputUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
    setOutputUrl("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleWidthChange = (v: number) => {
    setWidth(v);
    if (keepRatio && origW) setHeight(Math.round((v / origW) * origH));
  };

  const handleHeightChange = (v: number) => {
    setHeight(v);
    if (keepRatio && origH) setWidth(Math.round((v / origH) * origW));
  };

  const resize = () => {
    if (!preview) return;
    const canvas = canvasRef.current!;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const url = canvas.toDataURL("image/png");
      setOutputUrl(url);
    };
    img.src = preview;
  };

  const download = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    const base = file?.name.replace(/\.[^.]+$/, "") ?? "resized";
    a.download = `${base}_${width}x${height}.png`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>Resize Gambar</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Ubah ukuran gambar dengan presisi, langsung di browser.
      </p>

      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
            {isDragActive ? "Lepas file di sini..." : "Klik atau drag & drop gambar"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{file.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                Asli: {origW} x {origH} px
              </p>
            </div>
            <button onClick={() => { setFile(null); setPreview(""); setOutputUrl(""); }} style={{ color: "var(--text-3)" }}>
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>Lebar (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>Tinggi (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-1"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-2)" }}>
            <input
              type="checkbox"
              checked={keepRatio}
              onChange={(e) => setKeepRatio(e.target.checked)}
              className="rounded"
            />
            Pertahankan rasio aspek
          </label>

          <div className="flex gap-3">
            <button
              onClick={resize}
              className="px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Resize
            </button>
            {outputUrl && (
              <button
                onClick={download}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
                style={{ background: "#10b98120", color: "#10b981" }}
              >
                <DownloadSimple size={16} />
                Download
              </button>
            )}
          </div>

          {outputUrl && (
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--text-3)" }}>Preview hasil:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outputUrl} alt="hasil" className="max-w-full rounded-xl border" style={{ borderColor: "var(--border)" }} />
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
