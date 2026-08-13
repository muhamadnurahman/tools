"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, ArrowsClockwise, DownloadSimple, X, CheckCircle } from "@phosphor-icons/react";
import imageCompression from "browser-image-compression";

type ConvertFormat = "jpeg" | "png" | "webp";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "converting" | "done" | "error";
  outputUrl?: string;
  outputName?: string;
  error?: string;
}

export default function ImageConverterPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>("webp");
  const [quality, setQuality] = useState(85);

  const onDrop = useCallback((accepted: File[]) => {
    const items: FileItem[] = accepted.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      status: "idle",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"] },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const convertFile = async (item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "converting" } : f))
    );
    try {
      const options = {
        maxSizeMB: 10,
        fileType: `image/${targetFormat}` as const,
        initialQuality: quality / 100,
        useWebWorker: true,
      };
      const compressed = await imageCompression(item.file, options);
      const url = URL.createObjectURL(compressed);
      const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
      const baseName = item.file.name.replace(/\.[^.]+$/, "");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "done", outputUrl: url, outputName: `${baseName}.${ext}` }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "error", error: "Konversi gagal" } : f
        )
      );
    }
  };

  const convertAll = () => {
    files.filter((f) => f.status === "idle").forEach(convertFile);
  };

  const formats: ConvertFormat[] = ["jpeg", "png", "webp"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Konversi Gambar
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Konversi JPG, PNG, WEBP, dan format lainnya langsung di browser.
      </p>

      {/* Settings */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-2)" }}>
            Format tujuan
          </label>
          <div className="flex gap-2">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setTargetFormat(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                style={{
                  background: targetFormat === f ? "var(--accent)" : "var(--surface)",
                  color: targetFormat === f ? "white" : "var(--text-2)",
                  borderColor: targetFormat === f ? "var(--accent)" : "var(--border)",
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-40">
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
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {isDragActive ? "Lepas file di sini..." : "Klik atau drag & drop gambar di sini"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
          JPG, PNG, WEBP, GIF, BMP, SVG
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-4">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                    {item.file.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "idle" && (
                    <button
                      onClick={() => convertFile(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "var(--accent)", color: "white" }}
                    >
                      Konversi
                    </button>
                  )}
                  {item.status === "converting" && (
                    <ArrowsClockwise size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
                  )}
                  {item.status === "done" && (
                    <>
                      <CheckCircle size={16} weight="fill" color="#10b981" />
                      <a
                        href={item.outputUrl}
                        download={item.outputName}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "#10b98120", color: "#10b981" }}
                      >
                        Download
                      </a>
                    </>
                  )}
                  {item.status === "error" && (
                    <span className="text-xs" style={{ color: "#ef4444" }}>{item.error}</span>
                  )}
                  <button onClick={() => removeFile(item.id)} style={{ color: "var(--text-3)" }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={convertAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <DownloadSimple size={16} />
            Konversi Semua
          </button>
        </>
      )}
    </div>
  );
}
