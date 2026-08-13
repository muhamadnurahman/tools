"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, X } from "@phosphor-icons/react";
import imageCompression from "browser-image-compression";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "compressing" | "done" | "error";
  origSize: number;
  newSize?: number;
  outputUrl?: string;
  outputName?: string;
}

export default function ImageCompressorPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(75);
  const [maxSizeMB, setMaxSizeMB] = useState(1);

  const onDrop = useCallback((accepted: File[]) => {
    const items: FileItem[] = accepted.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      status: "idle",
      origSize: f.size,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
  });

  const compress = async (item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "compressing" } : f))
    );
    try {
      const compressed = await imageCompression(item.file, {
        maxSizeMB,
        initialQuality: quality / 100,
        useWebWorker: true,
      });
      const url = URL.createObjectURL(compressed);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "done",
                newSize: compressed.size,
                outputUrl: url,
                outputName: `compressed-${f.file.name}`,
              }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f))
      );
    }
  };

  const compressAll = () =>
    files.filter((f) => f.status === "idle").forEach(compress);

  const fmt = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Kompres Gambar
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Kurangi ukuran file gambar tanpa kehilangan terlalu banyak kualitas.
      </p>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
            Kualitas: {quality}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(+e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
            Ukuran maks: {maxSizeMB} MB
          </label>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(+e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {isDragActive ? "Lepas file..." : "Klik atau drag gambar"}
        </p>
      </div>

      {files.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-4">
            {files.map((item) => {
              const saved =
                item.newSize !== undefined
                  ? Math.round((1 - item.newSize / item.origSize) * 100)
                  : null;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                      {item.file.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                      {fmt(item.origSize)}
                      {item.newSize !== undefined && (
                        <span style={{ color: "#10b981" }}>
                          {" "}
                          &rarr; {fmt(item.newSize)} (-{saved}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "idle" && (
                      <button
                        onClick={() => compress(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        Kompres
                      </button>
                    )}
                    {item.status === "compressing" && (
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        Memproses...
                      </span>
                    )}
                    {item.status === "done" && (
                      <a
                        href={item.outputUrl}
                        download={item.outputName}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "#10b98120", color: "#10b981" }}
                      >
                        <DownloadSimple size={13} />
                        Download
                      </a>
                    )}
                    {item.status === "error" && (
                      <span className="text-xs" style={{ color: "#ef4444" }}>
                        Gagal
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((f) => f.id !== item.id))
                      }
                      style={{ color: "var(--text-3)" }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={compressAll}
            className="px-5 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: "var(--accent)", color: "white" }}
          >
            Kompres Semua
          </button>
        </>
      )}
    </div>
  );
}
