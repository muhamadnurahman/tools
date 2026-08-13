"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple } from "@phosphor-icons/react";

export default function PDFSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [splitting, setSplitting] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    // Get page count using pdf-lib
    try {
      const { PDFDocument } = await import("pdf-lib").catch(() => {
        throw new Error("pdf-lib belum terinstall");
      });
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPageCount(count);
      setFrom(1);
      setTo(count);
    } catch {
      setPageCount(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const split = async () => {
    if (!file) return;
    setSplitting(true);
    try {
      const { PDFDocument } = await import("pdf-lib").catch(() => {
        throw new Error("Paket pdf-lib belum terinstall. Jalankan: npm install pdf-lib");
      });
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
      const pages = await newDoc.copyPages(srcDoc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_p${from}-${to}.pdf`;
      a.click();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Pisah PDF
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Ekstrak halaman tertentu dari file PDF.
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
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              {pageCount > 0 ? `${pageCount} halaman` : "Memuat..."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Dari halaman
              </label>
              <input
                type="number"
                min={1}
                max={to}
                value={from}
                onChange={(e) => setFrom(Math.min(+e.target.value, to))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
                Sampai halaman
              </label>
              <input
                type="number"
                min={from}
                max={pageCount || 9999}
                value={to}
                onChange={(e) => setTo(Math.max(+e.target.value, from))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={split}
              disabled={splitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <DownloadSimple size={16} />
              {splitting ? "Memproses..." : "Pisah & Download"}
            </button>
            <button
              onClick={() => { setFile(null); setPageCount(0); }}
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
