import { NextResponse } from "next/server";
import { AUDIO_MODELS_BY_KIND, IMAGE_MODELS, MEDIA_PROVIDERS, VIDEO_MODELS } from "@/lib/daemon/mediaCatalog";

export async function GET() {
  return NextResponse.json({
    ok: true,
    providers: MEDIA_PROVIDERS,
    image: IMAGE_MODELS,
    video: VIDEO_MODELS,
    audio: AUDIO_MODELS_BY_KIND,
  });
}
