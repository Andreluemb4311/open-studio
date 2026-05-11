import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const GENERATED_THUMBNAILS_DIR = join(process.cwd(), "public", "generated", "thumbnails");
const GENERATED_THUMBNAILS_PUBLIC_PATH = "/generated/thumbnails";

function isRemoteHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function parseDataImageUrl(url: string): { mimeType: string; buffer: Buffer } | null {
  const match = url.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function extensionForImage(contentType: string, url: string) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";

  const cleanUrl = url.split("?")[0] ?? "";
  const match = cleanUrl.match(/[.]([a-z0-9]+)$/i);
  const ext = match?.[1]?.toLowerCase();
  return ext && ["webp", "png", "jpg", "jpeg"].includes(ext) ? ext : "png";
}

export async function cacheGeneratedImageUrls(urls: string[]) {
  if (!urls.length) return [];

  await mkdir(GENERATED_THUMBNAILS_DIR, { recursive: true });

  const timestamp = Date.now();

  return Promise.all(
    urls.map(async (url, index) => {
      const dataImage = parseDataImageUrl(url);
      if (dataImage) {
        const extension = extensionForImage(dataImage.mimeType, "");
        const suffix = Math.random().toString(36).slice(2, 8);
        const filename = `${timestamp}-${index}-${suffix}.${extension}`;
        await writeFile(join(GENERATED_THUMBNAILS_DIR, filename), dataImage.buffer);
        return `${GENERATED_THUMBNAILS_PUBLIC_PATH}/${filename}`;
      }

      if (!isRemoteHttpUrl(url)) return url;

      try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type") ?? "";

        if (!response.ok || !contentType.startsWith("image/")) {
          return url;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const extension = extensionForImage(contentType, url);
        const suffix = Math.random().toString(36).slice(2, 8);
        const filename = `${timestamp}-${index}-${suffix}.${extension}`;

        await writeFile(join(GENERATED_THUMBNAILS_DIR, filename), buffer);

        return `${GENERATED_THUMBNAILS_PUBLIC_PATH}/${filename}`;
      } catch {
        return url;
      }
    })
  );
}
