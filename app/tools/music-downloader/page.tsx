"use client";

import { useState } from "react";
import { DownloadSimple, ArrowsClockwise, MusicNote } from "@phosphor-icons/react";

const platforms = [
  { id: "soundcloud", label: "SoundCloud", color: "#ff5500", placeholder: "https://soundcloud.com/artist/track" },
  { id: "youtube-music", label: "YouTube Music", color: "#ef4444", placeholder: "https://music.youtube.com/watch?v=..." },
  { id: "youtube", label: "YouTube", color: "#ef4444", placeholder: "https://youtube.com/watch?v=..." },
  { id: "spotify", label: "Spotify*", color: "#1db954", placeholder: "https://open.spotify.com/track/..." },
  { id: "deezer", label: "Deezer", color: "#a238ff", placeholder: "https://deezer.com/track/..." },
];

type AudioFormat = "mp3" | "ogg" | "wav" | "opus" | "best";
type AudioQuality = "128" | "192" | "256" | "320";

type Result =
  | { type: "url"; url: string; filename?: string }
  | { type: "tunnel"; url: string; filename?: string };

export default function MusicDownloaderPage() {
  const [url, setUrl] = useState("");
  const [activePlatform, setActivePlatform] = useState("soundcloud");
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [quality, setQuality] = useState<AudioQuality>("320");
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
          downloadMode: "audio",
          audioFormat: format === "best" ? undefined : format,
          audioBitrate: quality,
          filenameStyle: "pretty",
        }),
      });

      const data = await res.json();

      if (data.status === "error") {
        const code = data.error?.code ?? "";
        if (code === "link.unsupported") {
          setError("Link tidak didukung. Pastikan URL valid dan platform didukung Cobalt.");
        } else if (activePlatform === "spotify") {
          setError("Spotify tidak didukung langsung. Coba salin link lagu dari YouTube Music atau SoundCloud.");
        } else {
          setError(data.error?.message ?? `Error: ${code}`);
        }
      } else if (data.status === "redirect" || data.status === "tunnel") {
        setResult({ type: data.status === "tunnel" ? "tunnel" : "url", url: data.url, filename: data.filename });
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
          <MusicNote size={18} weight="duotone" color="#ec4899" />
        </span>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>Download Musik</h1>
      </div>
      <p className="text-sm mb-8 ml-12" style={{ color: "var(--text-2)" }}>
        SoundCloud, YouTube Music, YouTube, Deezer, dan platform lainnya.
      </p>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {platforms.map((p) => (
          <button key={p.id}
            onClick={() => { setActivePlatform(p.id); setUrl(""); setResult(null); setError(""); }}
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

      {/* Catatan Spotify */}
      {activePlatform === "spotify" && (
        <div className="p-3 rounded-xl border mb-4 text-xs"
          style={{ background: "#1db95410", borderColor: "#1db95430", color: "#1db954" }}>
          * Spotify tidak menyediakan stream langsung. Cobalt akan mencari versi YouTube Music yang cocok.
          Hasilnya mungkin tidak selalu akurat.
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2 mb-5">
        <input type="url" value={url}
          onChange={(e) => { setUrl(e.target.value); setResult(null); setError(""); }}
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

      {/* Format & kualitas */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Format</p>
          <div className="flex gap-1.5">
            {(["mp3", "ogg", "wav", "opus"] as AudioFormat[]).map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-all"
                style={{
                  background: format === f ? "var(--accent)" : "var(--surface-2)",
                  color: format === f ? "white" : "var(--text-2)",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Bitrate</p>
          <div className="flex gap-1.5">
            {(["128", "192", "256", "320"] as AudioQuality[]).map((q) => (
              <button key={q} onClick={() => setQuality(q)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: quality === q ? "var(--accent)" : "var(--surface-2)",
                  color: quality === q ? "white" : "var(--text-2)",
                }}>
                {q}k
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

      {/* Hasil */}
      {result && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
              {result.filename ?? "Musik siap diunduh"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              {format.toUpperCase()} · {quality}kbps
            </p>
          </div>
          <button onClick={() => triggerDownload(result.url, result.filename)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
            style={{ background: "var(--accent)", color: "white" }}>
            <DownloadSimple size={15} />
            Unduh
          </button>
        </div>
      )}
    </div>
  );
}
