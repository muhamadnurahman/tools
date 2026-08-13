// Web Worker for background removal using @huggingface/transformers
// Runs RMBG-1.4 model entirely in the browser

import { env, AutoModel, AutoProcessor, RawImage } from "@huggingface/transformers";

// Use browser cache to avoid re-downloading
env.allowLocalModels = false;
env.useBrowserCache = true;

let model = null;
let processor = null;

async function loadModel(onProgress) {
  if (model && processor) return;

  onProgress({ status: "loading", message: "Mengunduh model AI (pertama kali ~50MB)..." });

  processor = await AutoProcessor.from_pretrained("briaai/RMBG-1.4", {
    progress_callback: (info) => {
      if (info.status === "progress" && info.total) {
        const pct = Math.round((info.loaded / info.total) * 100);
        onProgress({ status: "downloading", message: `Mengunduh model: ${pct}%`, progress: pct });
      }
    },
  });

  model = await AutoModel.from_pretrained("briaai/RMBG-1.4", {
    config: { model_type: "custom" },
    progress_callback: (info) => {
      if (info.status === "progress" && info.total) {
        const pct = Math.round((info.loaded / info.total) * 100);
        onProgress({ status: "downloading", message: `Memuat model: ${pct}%`, progress: pct });
      }
    },
  });

  onProgress({ status: "ready", message: "Model siap!" });
}

self.addEventListener("message", async (event) => {
  const { id, imageData } = event.data;

  try {
    await loadModel((progress) => {
      self.postMessage({ id, type: "progress", ...progress });
    });

    self.postMessage({ id, type: "progress", status: "processing", message: "Memproses gambar...", progress: null });

    // Load image from blob URL or data URL
    const image = await RawImage.fromURL(imageData);

    // Preprocess
    const { pixel_values } = await processor(image);

    // Run inference
    const { output } = await model({ input: pixel_values });

    // Get mask — output[0] is the alpha mask
    const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(image.width, image.height);

    // Create output canvas
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Draw original image
    const imgBitmap = await createImageBitmap(
      new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)
    );
    ctx.drawImage(imgBitmap, 0, 0);

    // Apply mask as alpha channel
    const imageDataObj = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageDataObj.data;
    const maskData = mask.data;

    for (let i = 0; i < maskData.length; i++) {
      pixels[i * 4 + 3] = maskData[i]; // set alpha
    }
    ctx.putImageData(imageDataObj, 0, 0);

    // Convert to blob
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const arrayBuffer = await blob.arrayBuffer();

    self.postMessage({ id, type: "result", buffer: arrayBuffer }, [arrayBuffer]);
  } catch (err) {
    self.postMessage({ id, type: "error", message: err.message || "Gagal memproses gambar" });
  }
});
