import { createAsset } from "@/lib/storage/assets";
import { createExport } from "@/lib/storage/exports";
import { cacheGeneratedImageUrls } from "@/lib/storage/generatedImages";
import { saveContentFile } from "@/lib/minimax/files";
import { buildThumbnailPrompt } from "@/lib/prompts/thumbnailPrompt";
import { getAdapterForProvider } from "./registry";
import { isDemoModeEnabled, resolveProviderConfig, type ProviderOverride } from "./runtime";
import type {
  ActiveProviderCapability,
  ImageGenerationRequest,
  ImageGenerationResult,
  TextGenerationRequest,
  TextGenerationResult,
} from "./types";

const packageSystemPrompt = `You are Open Studio's content package planner.
Convert a creator briefing into a publish-ready content package.
Return only valid JSON with this shape:
{
  "title": "project title",
  "script": "ready-to-record script",
  "description": "platform-ready description",
  "tags": ["tag"],
  "titleCandidates": [],
  "selectedTitle": "",
  "thumbnailPrompt": "visual prompt for image generation",
  "thumbnailText": "short readable thumbnail text",
  "assumptions": ["short assumption"]
}`;

function parseJsonObject(content: string): Record<string, unknown> {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  const json = start >= 0 && end >= start ? content.slice(start, end + 1) : content;
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {
      title: "Generated Package",
      script: content,
      description: "",
      tags: [],
      titleCandidates: [],
      selectedTitle: "",
      thumbnailPrompt: content.slice(0, 500),
      thumbnailText: "New Video",
      assumptions: ["The provider returned plain text instead of JSON."],
    };
  }
}

export async function generateTextWithProvider(
  request: TextGenerationRequest,
  override?: ProviderOverride
): Promise<TextGenerationResult> {
  if (await isDemoModeEnabled()) {
    return {
      content: `[DEMO MODE]\n\n${request.prompt}`,
      providerId: override?.providerId || "demo",
      model: override?.model || "demo-text",
    };
  }

  const config = await resolveProviderConfig("text", override);
  const adapter = getAdapterForProvider(config.providerId);
  if (!adapter.generateText) throw new Error(`${config.manifest.name} does not support text generation.`);
  return adapter.generateText(request, config);
}

export async function generateImageWithProvider(
  request: ImageGenerationRequest,
  override?: ProviderOverride
): Promise<ImageGenerationResult> {
  if (await isDemoModeEnabled()) {
    const text = encodeURIComponent(request.prompt.slice(0, 40) || "Open Studio");
    return {
      urls: [`https://placehold.co/1280x720/151922/ff5aa7?text=${text}`],
      base64s: [],
      finalPrompt: request.prompt,
      providerId: override?.providerId || "demo",
      model: override?.model || "demo-image",
    };
  }

  const config = await resolveProviderConfig("image", override);
  const adapter = getAdapterForProvider(config.providerId);
  if (!adapter.generateImage) throw new Error(`${config.manifest.name} does not support image generation.`);
  return adapter.generateImage(request, config);
}

export async function generateContentPackage(params: {
  briefing: string;
  steps?: ActiveProviderCapability[];
  providers?: Partial<Record<ActiveProviderCapability, ProviderOverride>>;
  saveToAssets?: boolean;
}): Promise<Record<string, unknown>> {
  const { briefing, steps = ["text", "image"], providers = {}, saveToAssets = true } = params;
  const textResult = await generateTextWithProvider(
    {
      systemPrompt: packageSystemPrompt,
      prompt: briefing,
      maxTokens: 4096,
      temperature: 0.7,
    },
    providers.text
  );

  const packageData = parseJsonObject(textResult.content);
  const title = String(packageData.title || `Open Studio - ${briefing.slice(0, 50)}`);
  const selectedTitle = String(packageData.selectedTitle || title);
  const script = String(packageData.script || textResult.content);
  const exportFiles: string[] = [];
  const outputs: Record<string, unknown> = {
    text: {
      ...packageData,
      selectedTitle,
      providerId: textResult.providerId,
      model: textResult.model,
    },
  };

  if (saveToAssets && script) {
    const timestamp = Date.now();
    const filename = `${timestamp}-open-studio-package-script.md`;
    await saveContentFile("scripts", filename, script);
    const filePath = `files/scripts/${filename}`;
    exportFiles.push(filePath);
    await createAsset({
      type: "script",
      title,
      description: briefing.slice(0, 200),
      content: script,
      filePath,
      metadata: packageData,
      sourceModule: "package-generator",
      tags: Array.isArray(packageData.tags) ? packageData.tags.map(String) : ["package"],
    });
  }

  if (steps.includes("image")) {
    const thumbnailPrompt = String(
      packageData.thumbnailPrompt ||
      buildThumbnailPrompt({
        theme: briefing,
        title,
        style: "Modern creator studio",
        text: String(packageData.thumbnailText || "New Video"),
      })
    );
    const imageResult = await generateImageWithProvider(
      { prompt: thumbnailPrompt, aspectRatio: "16:9", n: 1 },
      providers.image
    );
    const cachedUrls = await cacheGeneratedImageUrls(imageResult.urls);
    const cachedImageResult = {
      ...imageResult,
      urls: cachedUrls,
      rawUrls: imageResult.urls,
    };
    outputs.image = cachedImageResult;

    if (saveToAssets && cachedImageResult.urls[0]) {
      await createAsset({
        type: "thumbnail",
        title: `Thumbnail - ${selectedTitle}`,
        description: thumbnailPrompt,
        thumbnailPath: cachedImageResult.urls[0],
        metadata: cachedImageResult as unknown as Record<string, unknown>,
        sourceModule: "package-generator",
        tags: ["package", "thumbnail"],
      });
    }
  }

  const packageJson = {
    title,
    selectedTitle,
    briefing,
    script,
    description: String(packageData.description || ""),
    tags: Array.isArray(packageData.tags) ? packageData.tags.map(String) : [],
    titleCandidates: Array.isArray(packageData.titleCandidates) ? packageData.titleCandidates : [],
    thumbnailPrompt: String(packageData.thumbnailPrompt || ""),
    thumbnailText: String(packageData.thumbnailText || ""),
    outputs,
  };

  if (saveToAssets) {
    const timestamp = Date.now();
    const jsonFilename = `${timestamp}-content-package.json`;
    const mdFilename = `${timestamp}-content-package.md`;
    await saveContentFile("packages", jsonFilename, JSON.stringify(packageJson, null, 2));
    await saveContentFile(
      "exports",
      mdFilename,
      [
        `# ${selectedTitle}`,
        "",
        "## Briefing",
        briefing,
        "",
        "## Script",
        script,
        "",
        "## Thumbnail",
        String(packageData.thumbnailPrompt || ""),
      ].join("\n")
    );
    exportFiles.push(`files/packages/${jsonFilename}`, `files/exports/${mdFilename}`);
  }

  const exportRecord = saveToAssets
    ? await createExport({
        title,
        type: "package",
        status: "completed",
        files: exportFiles,
        progress: 100,
        format: "package",
        metadata: { briefing, outputs },
      })
    : null;

  return {
    ok: true,
    title,
    selectedTitle,
    briefing,
    package: packageJson,
    outputs,
    exportId: exportRecord?.id,
  };
}
