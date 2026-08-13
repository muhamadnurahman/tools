"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, X, ArrowUp, ArrowDown } from "@phosphor-icons/react";

interface PDFFile {
  id: string;
  file: File;
  name: string;
}

export default function PDFMergePage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const pdfs = accepted
      .filter((f) => f.type === "application/pdf")
      .map((f) => ({ id: Math.random().toString(36).slice(2), file: f, name: f.name }));
    setFiles((prev) => [...prev, ...pdfs]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (i: number) => {
    setFiles((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const merge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    // Requires pdf-lib — install with: npm install pdf-lib
    try {
      const { PDFDocument } = await import("pdf-lib").catch(() => {
        throw new Error("Paket pdf-lib belum terinstall. Jalankan: npm install pdf-lib");
      });
      const merged = await PDFDocument.create();
      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Gabung PDF
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Satukan beberapa file PDF menjadi satu. Atur urutannya sesuai keinginan.
      </p>

      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {isDragActive ? "Lepas file PDF..." : "Klik atau drag file PDF di sini"}
        </p>
      </div>

      {files.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-6">
            {files.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm truncate" style={{ color: "var(--text-1)" }}>
                  {item.name}
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {(item.file.size / 1024).toFixed(0)} KB
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="p-1 rounded disabled:opacity-30"
                    style={{ color: "var(--text-3)" }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === files.length - 1}
                    className="p-1 rounded disabled:opacity-30"
                    style={{ color: "var(--text-3)" }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1 rounded" style={{ color: "var(--text-3)" }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={merge}
            disabled={merging || files.length < 2}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <DownloadSimple size={16} />
            {merging ? "Menggabungkan..." : `Gabung ${files.length} PDF`}
          </button>

          {files.length < 2 && (
            <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
              Tambahkan minimal 2 file PDF.
            </p>
          )}
        </>
      )}
    </div>
  );
}
