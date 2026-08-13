import ToolGrid from "@/components/ToolGrid";

const categories = [
  {
    id: "gambar",
    label: "Gambar & Foto",
    color: "#6366f1",
    tools: [
      { href: "/tools/image-converter", icon: "ArrowsClockwise", label: "Konversi Gambar", desc: "JPG, PNG, WEBP, GIF, BMP, SVG" },
      { href: "/tools/image-resizer", icon: "ImageSquare", label: "Resize Gambar", desc: "Ubah ukuran dengan presisi" },
      { href: "/tools/remove-bg", icon: "Eraser", label: "Hapus Background", desc: "Hapus BG otomatis" },
      { href: "/tools/image-compressor", icon: "Scissors", label: "Kompres Gambar", desc: "Kurangi ukuran file" },
    ],
  },
  {
    id: "video",
    label: "Video & Musik",
    color: "#ec4899",
    tools: [
      { href: "/tools/video-downloader", icon: "DownloadSimple", label: "Download Video", desc: "YouTube, TikTok, Instagram, X" },
      { href: "/tools/music-downloader", icon: "DownloadSimple", label: "Download Musik", desc: "Spotify, SoundCloud, YouTube Music" },
    ],
  },
  {
    id: "pdf",
    label: "PDF",
    color: "#f59e0b",
    tools: [
      { href: "/tools/pdf-merge", icon: "FilePdf", label: "Gabung PDF", desc: "Satukan beberapa file PDF" },
      { href: "/tools/pdf-split", icon: "FilePdf", label: "Pisah PDF", desc: "Pisah halaman PDF" },
      { href: "/tools/pdf-compress", icon: "FilePdf", label: "Kompres PDF", desc: "Perkecil ukuran PDF" },
      { href: "/tools/image-to-pdf", icon: "FilePdf", label: "Gambar ke PDF", desc: "Gabung gambar jadi PDF" },
      { href: "/tools/pdf-to-image", icon: "Images", label: "PDF ke Gambar", desc: "Export halaman PDF ke PNG" },
    ],
  },
  {
    id: "teks",
    label: "Teks & Kode",
    color: "#10b981",
    tools: [
      { href: "/tools/text-tools", icon: "TextT", label: "Alat Teks", desc: "Word count, case converter, dll" },
      { href: "/tools/hash-generator", icon: "Hash", label: "Hash Generator", desc: "MD5, SHA-1, SHA-256" },
      { href: "/tools/password-generator", icon: "Lock", label: "Password Generator", desc: "Buat password kuat" },
    ],
  },
  {
    id: "lainnya",
    label: "Lainnya",
    color: "#8b5cf6",
    tools: [
      { href: "/tools/color-picker", icon: "Eyedropper", label: "Color Picker", desc: "HEX, RGB, HSL converter" },
      { href: "/tools/qr-generator", icon: "QrCode", label: "QR Code Generator", desc: "Buat QR code instan" },
      { href: "/tools/barcode-generator", icon: "Barcode", label: "Barcode Generator", desc: "Generate berbagai jenis barcode" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
          style={{ color: "var(--text-1)" }}
        >
          Semua tools yang kamu butuhkan,{" "}
          <span style={{ color: "var(--accent)" }}>gratis</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
          Convert, resize, download, hapus background, dan banyak lagi. Tanpa install, langsung di browser.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-12">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-6 rounded-full" style={{ background: cat.color }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                {cat.label}
              </h2>
            </div>
            <ToolGrid tools={cat.tools} color={cat.color} />
          </section>
        ))}
      </div>

      <p className="text-center text-sm mt-16" style={{ color: "var(--text-3)" }}>
        Semua tool berjalan di browser kamu. File tidak dikirim ke server manapun.
      </p>
    </div>
  );
}
