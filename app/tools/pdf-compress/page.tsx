"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple } from "@phosphor-icons/react";

export default function PDFCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const compress = async () => {
    if (!file) return;
    setCompressing(true);
    // PDF compression in-browser is limited — we demonstrate with pdf-lib re-save
    try {
      const { PDFDocument } = await import("pdf-lib").catch(() => {
        throw new Error("pdf-lib belum terinstall. Jalankan: npm install pdf-lib");
      });
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      // Re-save with objectsPerTick optimization
      const saved = await doc.save({ useObjectStreams: true });
      const blob = new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      a.click();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCompressing(false);
    }
  };

  const fmt = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Kompres PDF
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Perkecil ukuran file PDF dengan re-optimasi struktur internal.
      </p>

      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
            Upload file PDF
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div
            className="p-4 rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{file.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{fmt(file.size)}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={compress}
              disabled={compressing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <DownloadSimple size={16} />
              {compressing ? "Mengompres..." : "Kompres & Download"}
            </button>
            <button
              onClick={() => setFile(null)}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              Ganti file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
