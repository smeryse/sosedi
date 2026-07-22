import { ImageResponse } from "next/og";
import { AppIconArtwork } from "@/components/pwa/app-icon-artwork";

const supportedSizes = new Set([180, 192, 512]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const pixels = Number(size);

  if (!Number.isInteger(pixels) || !supportedSizes.has(pixels)) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(<AppIconArtwork />, {
    width: pixels,
    height: pixels,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
