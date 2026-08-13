"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, DownloadSimple, X, ArrowUp, ArrowDown, FilePdf } from "@phosphor-icons/react";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  name: string;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [converting, setConverting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const items = accepted
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
      }));
    setImages((prev) => [...prev, ...items]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
  });

  const moveUp = (i: number) => {
    if (i === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (i: number) => {
    setImages((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const remove = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  const convert = async () => {
    if (images.length === 0) return;
    setConverting(true);
    try {
      const { PDFDocument } = await import("pdf-lib");

      const pdf = await PDFDocument.create();

      for (const item of images) {
        const bytes = await item.file.arrayBuffer();
        let img;

        if (item.file.type === "image/jpeg" || item.file.type === "image/jpg") {
          img = await pdf.embedJpg(bytes);
        } else {
          // Untuk PNG, WEBP dll — convert dulu ke PNG via canvas
          const blob = await new Promise<Blob>((res) => {
            const canvas = document.createElement("canvas");
            const image = new Image();
            image.onload = () => {
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              canvas.getContext("2d")!.drawImage(image, 0, 0);
              canvas.toBlob((b) => res(b!), "image/png");
            };
            image.src = item.url;
          });
          const pngBytes = await blob.arrayBuffer();
          img = await pdf.embedPng(pngBytes);
        }

        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#f59e0b20" }}
        >
          <FilePdf size={18} weight="duotone" color="#f59e0b" />
        </span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Gambar ke PDF
        </h1>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: "var(--text-2)" }}>
        Gabungkan beberapa gambar menjadi satu file PDF. Atur urutan sesuai keinginan.
      </p>

      {/* Dropzone */}
      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <UploadSimple size={32} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {isDragActive ? "Lepas gambar di sini..." : "Klik atau drag gambar di sini"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>JPG, PNG, WEBP</p>
      </div>

      {/* Daftar gambar */}
      {images.length > 0 && (
        <>
          <div className="flex flex-col gap-2 mb-6">
            {images.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                />
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#f59e0b20", color: "#f59e0b" }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm truncate" style={{ color: "var(--text-1)" }}>
                  {item.name}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-3)" }}>
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
                    disabled={i === images.length - 1}
                    className="p-1 rounded disabled:opacity-30"
                    style={{ color: "var(--text-3)" }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-1 rounded"
                    style={{ color: "var(--text-3)" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={convert}
              disabled={converting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
              style={{ background: "#f59e0b", color: "white" }}
            >
              <DownloadSimple size={16} />
              {converting ? "Mengonversi..." : `Buat PDF (${images.length} gambar)`}
            </button>
            <button
              onClick={() => setImages([])}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              Hapus semua
            </button>
          </div>
        </>
      )}
    </div>
  );
}
