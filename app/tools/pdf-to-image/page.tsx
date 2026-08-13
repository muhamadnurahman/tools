"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, FilePdf, Images } from "@phosphor-icons/react";

interface PageResult {
  pageNum: number;
  url: string;
  width: number;
  height: number;
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [results, setResults] = useState<PageResult[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(2); // resolusi: 1x, 1.5x, 2x, 3x

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResults([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPageCount(pdf.numPages);
    } catch {
      setPageCount(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    setResults([]);
    setProgress(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pages: PageResult[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, canvas, viewport }).promise;

        const url = canvas.toDataURL("image/png");
        pages.push({ pageNum: i, url, width: Math.round(viewport.width), height: Math.round(viewport.height) });

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setResults(pages);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = () => {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = `${file?.name.replace(".pdf", "") ?? "page"}_halaman_${r.pageNum}.png`;
      a.click();
    });
  };

  const downloadOne = (r: PageResult) => {
    const a = document.createElement("a");
    a.href = r.url;
    a.download = `${file?.name.replace(".pdf", "") ?? "page"}_halaman_${r.pageNum}.png`;
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#f59e0b20" }}
        >
          <Images size={18} weight="duotone" color="#f59e0b" />
        </span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          PDF ke Gambar
        </h1>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: "var(--text-2)" }}>
        Konversi setiap halaman PDF menjadi gambar PNG beresolusi tinggi.
      </p>

      {/* Upload */}
      {!file && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <FilePdf size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
            {isDragActive ? "Lepas file PDF..." : "Klik atau drag file PDF di sini"}
          </p>
        </div>
      )}

      {/* File dipilih */}
      {file && (
        <div className="flex flex-col gap-5">
          {/* Info file */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                {file.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                {pageCount > 0 ? `${pageCount} halaman` : "Memuat..."} ·{" "}
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setResults([]); setPageCount(0); }}
              className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              Ganti
            </button>
          </div>

          {/* Opsi resolusi */}
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: "var(--text-2)" }}>
              Resolusi output
            </label>
            <div className="flex gap-2">
              {[
                { label: "Normal (1×)", value: 1 },
                { label: "Bagus (1.5×)", value: 1.5 },
                { label: "HD (2×)", value: 2 },
                { label: "Ultra (3×)", value: 3 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: scale === opt.value ? "var(--accent)" : "var(--surface-2)",
                    color: scale === opt.value ? "white" : "var(--text-2)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol konversi */}
          {results.length === 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={convert}
                disabled={converting || pageCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                style={{ background: "#f59e0b", color: "white" }}
              >
                <Images size={16} />
                {converting
                  ? `Mengonversi... ${progress}%`
                  : `Konversi ${pageCount} halaman`}
              </button>
            </div>
          )}

          {/* Progress bar saat konversi */}
          {converting && (
            <div className="flex flex-col gap-2">
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--surface-3)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "#f59e0b" }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Memproses halaman {Math.ceil((progress / 100) * pageCount)} dari {pageCount}...
              </p>
            </div>
          )}

          {/* Hasil */}
          {results.length > 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                  {results.length} halaman berhasil dikonversi
                </p>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#f59e0b", color: "white" }}
                >
                  <DownloadSimple size={15} />
                  Download Semua
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.map((r) => (
                  <div
                    key={r.pageNum}
                    className="rounded-xl overflow-hidden border flex flex-col"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt={`Halaman ${r.pageNum}`} className="w-full object-contain" />
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        Hal. {r.pageNum} · {r.width}×{r.height}
                      </span>
                      <button
                        onClick={() => downloadOne(r)}
                        className="p-1 rounded"
                        style={{ color: "var(--accent)" }}
                      >
                        <DownloadSimple size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setResults([]); setProgress(0); }}
                className="self-start text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
              >
                Konversi ulang
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
