import { NextRequest, NextResponse } from "next/server";

// Proxy ke Cobalt instance untuk menghindari CORS dan menyembunyikan instance URL.
// Set COBALT_API_URL di .env.local untuk instance sendiri, atau pakai default community instance.
const COBALT_API = process.env.COBALT_API_URL ?? "https://cobalt.imput.net";
const COBALT_API_KEY = process.env.COBALT_API_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ status: "error", error: { code: "invalid_url" } }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    if (COBALT_API_KEY) {
      headers["Authorization"] = `Api-Key ${COBALT_API_KEY}`;
    }

    const cobaltRes = await fetch(`${COBALT_API}/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // Timeout 30 detik
      signal: AbortSignal.timeout(30_000),
    });

    const data = await cobaltRes.json();
    return NextResponse.json(data, { status: cobaltRes.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghubungi server";
    return NextResponse.json({ status: "error", error: { code: "proxy_error", message: msg } }, { status: 500 });
  }
}
