import { describe, expect, it } from "vitest";
import { NvcfAssetClient } from "./nvcf-asset-client";

describe("Phase 4: NVCF Asset API & Image Moderation Tests", () => {
  it("correctly identifies images > 180 KB requiring NVCF Asset API upload", () => {
    const client = new NvcfAssetClient();
    const smallBuffer = Buffer.alloc(100 * 1024); // 100 KB
    const largeBuffer = Buffer.alloc(250 * 1024); // 250 KB

    expect(client.isAssetUploadRequired(smallBuffer.byteLength)).toBe(false);
    expect(client.isAssetUploadRequired(largeBuffer.byteLength)).toBe(true);
  });

  it("prepares base64 payload for images <= 180 KB without external upload", async () => {
    const client = new NvcfAssetClient();
    const smallBuffer = Buffer.from("fake-small-image-bytes");

    const payload = await client.prepareImagePayload(smallBuffer, undefined, "image/png");
    expect(payload.type).toBe("base64");
    expect(payload.value).toContain("data:image/png;base64,");
  });

  it("prepares signed_url payload when URL is provided and size is small", async () => {
    const client = new NvcfAssetClient();
    const smallBuffer = Buffer.from("small");

    const payload = await client.prepareImagePayload(
      smallBuffer,
      "https://storage.sosedi.local/avatars/anna.jpg",
      "image/jpeg"
    );
    expect(payload.type).toBe("signed_url");
    expect(payload.value).toBe("https://storage.sosedi.local/avatars/anna.jpg");
  });
});
