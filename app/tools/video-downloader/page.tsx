"use client";

import { useState } from "react";
import { DownloadSimple, ArrowsClockwise, VideoCamera } from "@phosphor-icons/react";

const platforms = [
  { id: "youtube", label: "YouTube", color: "#ef4444", placeholder: "https://youtube.com/watch?v=..." },
  { id: "tiktok", label: "TikTok", color: "#69C9D0", placeholder: "https://tiktok.com/@user/video/..." },
  { id: "instagram", label: "Instagram", color: "#e1306c", placeholder: "https://instagram.com/p/..." },
  { id: "twitter", label: "X / Twitter", color: "#1d9bf0", placeholder: "https://x.com/user/status/..." },
  { id: "facebook", label: "Facebook", color: "#1877f2", placeholder: "https://facebook.com/watch?v=..." },
  { id: "vimeo", label: "Vimeo", color: "#1ab7ea", placeholder: "https://vimeo.com/..." },
];

type VideoQuality = "144" | "240" | "360" | "480" | "720" | "1080" | "max";
type DownloadMode = "auto" | "audio" | "mute";

type Result =
  | { type: "url"; url: string; filename?: string }
  | { type: "picker"; picker: { url: string; type: string }[] }
  | { type: "tunnel"; url: string; filename?: string };

export default function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [activePlatform, setActivePlatform] = useState("youtube");
  const [quality, setQuality] = useState<VideoQuality>("1080");
  const [mode, setMode] = useState<DownloadMode>("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const current = platforms.find((p) => p.id === activePlatform)!;

  const download = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/cobalt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          videoQuality: quality,
          downloadMode: mode,
          filenameStyle: "pretty",
        }),
      });

      const data = await res.json();

      if (data.status === "error") {
        setError(data.error?.code === "content.too_long"
          ? "Video terlalu panjang untuk diunduh."
          : data.error?.code === "link.unsupported"
          ? "Link tidak didukung. Pastikan URL valid."
          : data.error?.message ?? `Error: ${data.error?.code ?? "unknown"}`);
      } else if (data.status === "redirect" || data.status === "tunnel") {
        setResult({ type: data.status === "tunnel" ? "tunnel" : "url", url: data.url, filename: data.filename });
      } else if (data.status === "picker") {
        setResult({ type: "picker", picker: data.picker });
      } else {
        setError("Respons tidak dikenali dari server.");
      }
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (downloadUrl: string, filename?: string) => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    if (filename) a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#ec489920" }}>
          <VideoCamera size={18} weight="duotone" color="#ec4899" />
        </span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>Download Video</h1>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: "var(--text-2)" }}>
        YouTube, TikTok, Instagram, X, Facebook, Vimeo, dan 20+ platform lainnya.
      </p>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {platforms.map((p) => (
          <button key={p.id} onClick={() => { setActivePlatform(p.id); setUrl(""); setResult(null); setError(""); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: activePlatform === p.id ? p.color + "20" : "var(--surface)",
              color: activePlatform === p.id ? p.color : "var(--text-2)",
              borderColor: activePlatform === p.id ? p.color + "50" : "var(--border)",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* URL input */}
      <div className="flex gap-2 mb-5">
        <input type="url" value={url} onChange={(e) => { setUrl(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && download()}
          placeholder={current.placeholder}
          className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-1)" }} />
        <button onClick={download} disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}>
          {loading
            ? <ArrowsClockwise size={16} className="animate-spin" />
            : <DownloadSimple size={16} />}
          {loading ? "Proses..." : "Download"}
        </button>
      </div>

      {/* Opsi kualitas & mode */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Kualitas video</p>
          <div className="flex gap-1.5">
            {(["360", "720", "1080", "max"] as VideoQuality[]).map((q) => (
              <button key={q} onClick={() => setQuality(q)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: quality === q ? "var(--accent)" : "var(--surface-2)",
                  color: quality === q ? "white" : "var(--text-2)",
                }}>
                {q === "max" ? "Max" : `${q}p`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Mode</p>
          <div className="flex gap-1.5">
            {([
              { value: "auto", label: "Video+Audio" },
              { value: "audio", label: "Audio saja" },
              { value: "mute", label: "Video saja" },
            ] as { value: DownloadMode; label: string }[]).map((m) => (
              <button key={m.value} onClick={() => setMode(m.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: mode === m.value ? "var(--accent)" : "var(--surface-2)",
                  color: mode === m.value ? "white" : "var(--text-2)",
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border mb-4 text-sm"
          style={{ background: "#ef444410", borderColor: "#ef444430", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* Hasil: single URL */}
      {result && (result.type === "url" || result.type === "tunnel") && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
              {result.filename ?? "Video siap diunduh"}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>{result.url}</p>
          </div>
          <button onClick={() => triggerDownload(result.url, result.filename)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
            style={{ background: "var(--accent)", color: "white" }}>
            <DownloadSimple size={15} />
            Unduh
          </button>
        </div>
      )}

      {/* Hasil: picker (beberapa pilihan) */}
      {result?.type === "picker" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-1)" }}>
            Pilih file yang ingin diunduh:
          </p>
          {result.picker.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border flex items-center justify-between gap-3"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-sm" style={{ color: "var(--text-2)" }}>
                {item.type === "photo" ? "🖼 Foto" : item.type === "gif" ? "🎞 GIF" : `🎬 Video ${i + 1}`}
              </span>
              <button onClick={() => triggerDownload(item.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--accent)", color: "white" }}>
                <DownloadSimple size={13} />
                Unduh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
