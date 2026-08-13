import { env, AutoModel, AutoProcessor, RawImage } from "@huggingface/transformers";

// Cache model di browser agar tidak perlu download ulang
env.allowLocalModels = false;
env.useBrowserCache = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let processor: any = null;

async function loadModel() {
  if (model !== null && processor !== null) return;

  self.postMessage({ type: "progress", status: "downloading", message: "Mengunduh model AI... (pertama kali ~50MB, tersimpan di cache)", progress: 0 });

  processor = await AutoProcessor.from_pretrained("briaai/RMBG-1.4", {
    // @ts-ignore
    progress_callback: (info: { status: string; loaded?: number; total?: number }) => {
      if (info.status === "progress" && info.total) {
        const pct = Math.round((info.loaded! / info.total) * 100);
        self.postMessage({ type: "progress", status: "downloading", message: `Mengunduh model: ${pct}%`, progress: pct });
      }
    },
  });

  model = await AutoModel.from_pretrained("briaai/RMBG-1.4", {
    // @ts-ignore
    config: { model_type: "custom" },
    // @ts-ignore
    progress_callback: (info: { status: string; loaded?: number; total?: number }) => {
      if (info.status === "progress" && info.total) {
        const pct = Math.round((info.loaded! / info.total) * 100);
        self.postMessage({ type: "progress", status: "loading", message: `Memuat model: ${pct}%`, progress: pct });
      }
    },
  });

  self.postMessage({ type: "progress", status: "ready", message: "Model siap!", progress: 100 });
}

self.addEventListener("message", async (event: MessageEvent) => {
  const { id, imageURL } = event.data;

  try {
    await loadModel();

    self.postMessage({ id, type: "progress", status: "processing", message: "Memproses gambar dengan AI...", progress: null });

    // Load gambar
    const image = await RawImage.fromURL(imageURL);

    // Preprocess
    // @ts-ignore
    const { pixel_values } = await processor(image);

    // Inferensi model
    // @ts-ignore
    const { output } = await model({ input: pixel_values });

    // Ambil mask alpha dari output pertama
    // @ts-ignore
    const maskTensor = output[0].mul(255).to("uint8");
    const mask = await RawImage.fromTensor(maskTensor).resize(image.width, image.height);

    // Render ke OffscreenCanvas
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d")!;

    // Gambar image asli
    const imgData = new ImageData(
      new Uint8ClampedArray(image.data as Uint8Array),
      image.width,
      image.height
    );
    const bitmap = await createImageBitmap(imgData);
    ctx.drawImage(bitmap, 0, 0);

    // Terapkan mask sebagai alpha channel
    const outputData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = outputData.data;
    const maskData = mask.data as Uint8Array;
    for (let i = 0; i < maskData.length; i++) {
      pixels[i * 4 + 3] = maskData[i];
    }
    ctx.putImageData(outputData, 0, 0);

    // Convert ke blob PNG (transparan)
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const arrayBuffer = await blob.arrayBuffer();

    // Transfer ArrayBuffer ke main thread agar tidak di-copy (lebih efisien)
    (self as unknown as Worker).postMessage(
      { id, type: "result", buffer: arrayBuffer, width: image.width, height: image.height },
      [arrayBuffer]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memproses gambar";
    self.postMessage({ id, type: "error", message: msg });
  }
});
