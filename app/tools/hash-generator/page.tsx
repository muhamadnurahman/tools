"use client";

import { useState } from "react";
import { Copy, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";

type HashType = "md5" | "sha1" | "sha256" | "sha512";

async function computeHash(text: string, algo: HashType): Promise<string> {
  const algoMap: Record<HashType, string> = {
    md5: "MD5",
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha512: "SHA-512",
  };
  // MD5 not supported by SubtleCrypto — use simple fallback
  if (algo === "md5") {
    // Simple JS MD5 implementation (for demo purposes)
    return simpleMd5(text);
  }
  const buf = await crypto.subtle.digest(
    algoMap[algo],
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Basic MD5 for browser (no SubtleCrypto support)
function simpleMd5(str: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff)) >>> 0;
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const utf8 = unescape(encodeURIComponent(str));
  const bytes: number[] = [];
  for (let i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));

  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);

  const bitLen = utf8.length * 8;
  for (let i = 0; i < 8; i++) bytes.push(i < 4 ? (bitLen >>> (i * 8)) & 0xff : 0);

  const M: number[] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    M.push(bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24));
  }

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < M.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    const m = M.slice(i, i + 16);
    a = md5ff(a, b, c, d, m[0],  7,  -680876936); d = md5ff(d, a, b, c, m[1], 12,  -389564586);
    c = md5ff(c, d, a, b, m[2], 17,   606105819); b = md5ff(b, c, d, a, m[3], 22, -1044525330);
    a = md5ff(a, b, c, d, m[4],  7,  -176418897); d = md5ff(d, a, b, c, m[5], 12,  1200080426);
    c = md5ff(c, d, a, b, m[6], 17, -1473231341); b = md5ff(b, c, d, a, m[7], 22,   -45705983);
    a = md5ff(a, b, c, d, m[8],  7,  1770035416); d = md5ff(d, a, b, c, m[9], 12, -1958414417);
    c = md5ff(c, d, a, b, m[10], 17,      -42063); b = md5ff(b, c, d, a, m[11], 22, -1990404162);
    a = md5ff(a, b, c, d, m[12],  7,  1804603682); d = md5ff(d, a, b, c, m[13], 12,   -40341101);
    c = md5ff(c, d, a, b, m[14], 17, -1502002290); b = md5ff(b, c, d, a, m[15], 22,  1236535329);
    a = md5gg(a, b, c, d, m[1],  5,  -165796510); d = md5gg(d, a, b, c, m[6],  9,  -1069501632);
    c = md5gg(c, d, a, b, m[11], 14,   643717713); b = md5gg(b, c, d, a, m[0], 20,  -373897302);
    a = md5gg(a, b, c, d, m[5],  5,  -701558691); d = md5gg(d, a, b, c, m[10],  9,    38016083);
    c = md5gg(c, d, a, b, m[15], 14,  -660478335); b = md5gg(b, c, d, a, m[4], 20,  -405537848);
    a = md5gg(a, b, c, d, m[9],  5,   568446438); d = md5gg(d, a, b, c, m[14],  9, -1019803690);
    c = md5gg(c, d, a, b, m[3], 14,  -187363961); b = md5gg(b, c, d, a, m[8], 20,  1163531501);
    a = md5gg(a, b, c, d, m[13],  5, -1444681467); d = md5gg(d, a, b, c, m[2],  9,  -51403784);
    c = md5gg(c, d, a, b, m[7], 14,  1735328473); b = md5gg(b, c, d, a, m[12], 20, -1926607734);
    a = md5hh(a, b, c, d, m[5],  4,     -378558); d = md5hh(d, a, b, c, m[8], 11, -2022574463);
    c = md5hh(c, d, a, b, m[11], 16,  1839030562); b = md5hh(b, c, d, a, m[14], 23,   -35309556);
    a = md5hh(a, b, c, d, m[1],  4, -1530992060); d = md5hh(d, a, b, c, m[4], 11,  1272893353);
    c = md5hh(c, d, a, b, m[7], 16,  -155497632); b = md5hh(b, c, d, a, m[10], 23, -1094730640);
    a = md5hh(a, b, c, d, m[13],  4,   681279174); d = md5hh(d, a, b, c, m[0], 11,  -358537222);
    c = md5hh(c, d, a, b, m[3], 16,  -722521979); b = md5hh(b, c, d, a, m[6], 23,    76029189);
    a = md5hh(a, b, c, d, m[9],  4,  -640364487); d = md5hh(d, a, b, c, m[12], 11,  -421815835);
    c = md5hh(c, d, a, b, m[15], 16,   530742520); b = md5hh(b, c, d, a, m[2], 23,  -995338651);
    a = md5ii(a, b, c, d, m[0],  6,  -198630844); d = md5ii(d, a, b, c, m[7], 10,  1126891415);
    c = md5ii(c, d, a, b, m[14], 15, -1416354905); b = md5ii(b, c, d, a, m[5], 21,   -57434055);
    a = md5ii(a, b, c, d, m[12],  6,  1700485571); d = md5ii(d, a, b, c, m[3], 10, -1894986606);
    c = md5ii(c, d, a, b, m[10], 15,    -1051523); b = md5ii(b, c, d, a, m[1], 21, -2054922799);
    a = md5ii(a, b, c, d, m[8],  6,  1873313359); d = md5ii(d, a, b, c, m[15], 10,   -30611744);
    c = md5ii(c, d, a, b, m[6], 15, -1560198380); b = md5ii(b, c, d, a, m[13], 21,  1309151649);
    a = md5ii(a, b, c, d, m[4],  6,  -145523070); d = md5ii(d, a, b, c, m[11], 10, -1120210379);
    c = md5ii(c, d, a, b, m[2], 15,   718787259); b = md5ii(b, c, d, a, m[9], 21,  -343485551);
    a = (a + aa) >>> 0; b = (b + bb) >>> 0; c = (c + cc) >>> 0; d = (d + dd) >>> 0;
  }

  return [a, b, c, d]
    .map((v) =>
      Array.from({ length: 4 }, (_, i) => ((v >>> (i * 8)) & 0xff).toString(16).padStart(2, "0")).join("")
    )
    .join("");
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<HashType, string>>({
    md5: "", sha1: "", sha256: "", sha512: "",
  });
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const generate = async () => {
    setLoading(true);
    const [md5, sha1, sha256, sha512] = await Promise.all([
      computeHash(input, "md5"),
      computeHash(input, "sha1"),
      computeHash(input, "sha256"),
      computeHash(input, "sha512"),
    ]);
    setHashes({ md5, sha1, sha256, sha512 });
    setLoading(false);
  };

  const copy = (key: HashType, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  };

  const algoList: { key: HashType; label: string; bits: string }[] = [
    { key: "md5", label: "MD5", bits: "128-bit" },
    { key: "sha1", label: "SHA-1", bits: "160-bit" },
    { key: "sha256", label: "SHA-256", bits: "256-bit" },
    { key: "sha512", label: "SHA-512", bits: "512-bit" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-1)" }}>
        Hash Generator
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
        Generate MD5, SHA-1, SHA-256, dan SHA-512 dari teks.
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Masukkan teks untuk di-hash..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none mb-4"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-1)",
          fontFamily: "var(--font-mono)",
        }}
      />

      <button
        onClick={generate}
        disabled={loading || !input.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm mb-6 disabled:opacity-50"
        style={{ background: "var(--accent)", color: "white" }}
      >
        {loading && <ArrowsClockwise size={15} className="animate-spin" />}
        Generate Hash
      </button>

      <div className="flex flex-col gap-3">
        {algoList.map(({ key, label, bits }) => (
          <div
            key={key}
            className="p-4 rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--surface-3)", color: "var(--text-3)" }}>
                  {bits}
                </span>
              </div>
              {hashes[key] && (
                <button
                  onClick={() => copy(key, hashes[key])}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                  style={{ background: "var(--surface-3)", color: "var(--text-2)" }}
                >
                  {copiedKey === key ? (
                    <CheckCircle size={13} color="#10b981" weight="fill" />
                  ) : (
                    <Copy size={13} />
                  )}
                  {copiedKey === key ? "Tersalin" : "Salin"}
                </button>
              )}
            </div>
            <p
              className="text-xs break-all"
              style={{
                color: hashes[key] ? "var(--accent-light)" : "var(--text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {hashes[key] || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
