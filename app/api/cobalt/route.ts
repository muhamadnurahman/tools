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

    // Coba beberapa instance sebagai fallback
    const instances = [
      COBALT_API,
      "https://cobalt.imput.net",
      "https://co.wuk.sh",
    ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

    let lastError = "";
    for (const instance of instances) {
      try {
        const cobaltRes = await fetch(`${instance}/`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(20_000),
        });
        const data = await cobaltRes.json();
        return NextResponse.json(data, { status: cobaltRes.status });
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        continue; // coba instance berikutnya
      }
    }

    return NextResponse.json(
      { status: "error", error: { code: "all_instances_failed", message: lastError } },
      { status: 503 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghubungi server";
    return NextResponse.json({ status: "error", error: { code: "proxy_error", message: msg } }, { status: 500 });
  }
}
