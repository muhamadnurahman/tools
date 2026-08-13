"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, ArrowsClockwise, Sparkle } from "@phosphor-icons/react";

type Status =
  | { state: "idle" }
  | { state: "downloading"; message: string; progress: number }
  | { state: "loading"; message: string; progress: number }
  | { state: "processing"; message: string }
  | { state: "done"; resultURL: string; originalURL: string; width: number; height: number }
  | { state: "error"; message: string };

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const workerRef = useRef<Worker | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreviewURL(URL.createObjectURL(f));
    setStatus({ state: "idle" });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  const processImage = () => {
    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    // Buat worker sekali, reuse untuk gambar berikutnya (model sudah di-cache)
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("./worker.ts", import.meta.url),
        { type: "module" }
      );
    }

    const worker = workerRef.current;
    const id = Date.now().toString();

    setStatus({ state: "downloading", message: "Mempersiapkan model AI...", progress: 0 });

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;
      // Abaikan pesan dari proses sebelumnya
      if (data.id && data.id !== id) return;

      if (data.type === "progress") {
        if (data.status === "downloading") {
          setStatus({ state: "downloading", message: data.message, progress: data.progress ?? 0 });
        } else if (data.status === "loading") {
          setStatus({ state: "loading", message: data.message, progress: data.progress ?? 0 });
        } else if (data.status === "processing") {
          setStatus({ state: "processing", message: data.message });
        }
        // "ready" tidak perlu ditampilkan, langsung processing
      } else if (data.type === "result") {
        URL.revokeObjectURL(imageURL);
        const blob = new Blob([data.buffer], { type: "image/png" });
        setStatus({
          state: "done",
          resultURL: URL.createObjectURL(blob),
          originalURL: previewURL,
          width: data.width,
          height: data.height,
        });
      } else if (data.type === "error") {
        URL.revokeObjectURL(imageURL);
        setStatus({ state: "error", message: data.message });
      }
    };

    worker.onerror = (e) => {
      setStatus({ state: "error", message: e.message || "Terjadi kesalahan pada worker" });
    };

    worker.postMessage({ id, imageURL });
  };

  const reset = () => {
    setFile(null);
    setPreviewURL("");
    setStatus({ state: "idle" });
  };

  const download = () => {
    if (status.state !== "done") return;
    const a = document.createElement("a");
    a.href = status.resultURL;
    a.download = `${file?.name.replace(/\.[^.]+$/, "") ?? "image"}_no_bg.png`;
    a.click();
  };

  const isProcessing =
    status.state === "downloading" ||
    status.state === "loading" ||
    status.state === "processing";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#6366f120" }}
        >
          <Sparkle size={18} weight="duotone" color="#6366f1" />
        </span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Hapus Background
        </h1>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: "var(--text-2)" }}>
        AI model{" "}
        <code
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ background: "var(--surface-3)", color: "var(--accent)" }}
        >
          RMBG-1.4
        </code>{" "}
        — berjalan 100% di browser, file tidak dikirim ke server manapun.
      </p>

      {/* Upload area */}
      {!file && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
            {isDragActive ? "Lepas gambar di sini..." : "Klik atau drag gambar di sini"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>JPG, PNG, WEBP</p>
        </div>
      )}

      {/* Gambar dipilih, belum diproses */}
      {file && status.state === "idle" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewURL}
              alt="Preview"
              className="w-full max-h-72 object-contain"
              style={{ background: "var(--surface-2)" }}
            />
            <div
              className="p-3 flex items-center justify-between gap-3"
              style={{ background: "var(--surface)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={reset}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
                >
                  Ganti
                </button>
                <button
                  onClick={processImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  <Sparkle size={15} />
                  Hapus Background
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status loading / processing */}
      {isProcessing && (
        <div
          className="rounded-xl border p-6 flex flex-col gap-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewURL}
            alt="Preview"
            className="w-full max-h-56 object-contain rounded-lg opacity-40"
            style={{ background: "var(--surface-2)" }}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                {(status as { message: string }).message}
              </p>
              {"progress" in status && typeof status.progress === "number" && (
                <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
                  {status.progress}%
                </span>
              )}
            </div>

            {"progress" in status && typeof status.progress === "number" && (
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--surface-3)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%`, background: "var(--accent)" }}
                />
              </div>
            )}

            {status.state === "processing" && (
              <div className="flex items-center gap-2 mt-1">
                <ArrowsClockwise
                  size={13}
                  className="animate-spin"
                  style={{ color: "var(--accent)" }}
                />
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  Sedang menganalisis gambar dengan AI...
                </span>
              </div>
            )}
          </div>

          {(status.state === "downloading" || status.state === "loading") && (
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              Model diunduh sekali dan tersimpan di cache browser. Proses berikutnya akan langsung mulai.
            </p>
          )}
        </div>
      )}

      {/* Hasil */}
      {status.state === "done" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-center" style={{ color: "var(--text-3)" }}>
                Sebelum
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={status.originalURL} alt="Original" className="w-full object-contain max-h-56" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-center" style={{ color: "var(--text-3)" }}>
                Sesudah
              </p>
              {/* Checkerboard untuk preview transparansi */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23444'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23444'/%3E%3Crect x='8' width='8' height='8' fill='%23333'/%3E%3Crect y='8' width='8' height='8' fill='%23333'/%3E%3C/svg%3E\")",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={status.resultURL} alt="Result" className="w-full object-contain max-h-56" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={download}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <DownloadSimple size={16} />
              Download PNG
            </button>
            <button
              onClick={reset}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              Gambar lain
            </button>
          </div>

          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            {status.width} × {status.height} px · Format PNG transparan
          </p>
        </div>
      )}

      {/* Error */}
      {status.state === "error" && (
        <div
          className="rounded-xl border p-5 flex flex-col gap-3"
          style={{ background: "#ef444410", borderColor: "#ef444430" }}
        >
          <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
            Terjadi kesalahan
          </p>
          <p className="text-xs" style={{ color: "var(--text-2)" }}>{status.message}</p>
          <button
            onClick={() => setStatus({ state: "idle" })}
            className="self-start px-4 py-2 rounded-lg text-sm"
            style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
          >
            Coba lagi
          </button>
        </div>
      )}
    </div>
  );
}
