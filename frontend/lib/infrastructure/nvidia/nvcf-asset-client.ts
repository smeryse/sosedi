import { getNvidiaConfig } from "../../config/nvidia-config";
import { globalNvidiaClient } from "./nvidia-client";
import { NvidiaApiError, NvidiaAuthError } from "./nvidia-errors";

export interface NvcfAssetResponse {
  assetId: string;
  uploadUrl: string;
}

export class NvcfAssetClient {
  private readonly config = getNvidiaConfig();
  private readonly NVCF_ASSET_THRESHOLD_BYTES = 180 * 1024; // 180 KB

  public isAssetUploadRequired(byteLength: number): boolean {
    return byteLength > this.NVCF_ASSET_THRESHOLD_BYTES;
  }

  public async uploadAsset(imageBuffer: Buffer, mimeType: string = "image/jpeg"): Promise<NvcfAssetResponse> {
    if (!this.config.apiKey) {
      throw new NvidiaAuthError("NVIDIA_API_KEY не задан.");
    }

    // 1. Request asset upload URL from NVCF Asset API
    const assetApiUrl = "https://api.nvcf.nvidia.com/v2/nvcf/assets";
    const payload = {
      description: "Sosedi Platform Image Moderation Asset",
      contentType: mimeType,
    };

    try {
      const initRes = await globalNvidiaClient.post<{ assetId: string; uploadUrl: string }>(
        assetApiUrl,
        payload,
        { timeoutMs: 10000 }
      );

      if (!initRes || !initRes.assetId || !initRes.uploadUrl) {
        throw new NvidiaApiError("NVCF Asset API не вернул assetId или uploadUrl.");
      }

      // 2. Upload image binary data to S3 uploadUrl
      const uploadRes = await fetch(initRes.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
          "x-amz-meta-nvcf-asset-description": "Sosedi Platform Image Moderation Asset",
        },
        body: imageBuffer as any,
      });

      if (!uploadRes.ok) {
        throw new NvidiaApiError(`Не удалось загрузить бинарные данные изображения в S3 (${uploadRes.status}).`);
      }

      return {
        assetId: initRes.assetId,
        uploadUrl: initRes.uploadUrl,
      };
    } catch (err) {
      console.warn("[NVCF Asset Upload Warning] Failed to upload asset to NVCF API:", err);
      throw err instanceof NvidiaApiError ? err : new NvidiaApiError("Ошибка при вызове NVCF Asset API");
    }
  }

  public async prepareImagePayload(
    imageBuffer: Buffer,
    imageUrl?: string,
    mimeType: string = "image/jpeg"
  ): Promise<{ type: "asset_id" | "signed_url" | "base64"; value: string }> {
    if (this.isAssetUploadRequired(imageBuffer.byteLength)) {
      try {
        const asset = await this.uploadAsset(imageBuffer, mimeType);
        return { type: "asset_id", value: asset.assetId };
      } catch (err) {
        console.warn("[NVCF Asset Fallback] Upload failed, falling back to signed URL or base64.");
      }
    }

    if (imageUrl && imageUrl.startsWith("http")) {
      return { type: "signed_url", value: imageUrl };
    }

    const base64Str = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
    return { type: "base64", value: base64Str };
  }
}

export const globalNvcfAssetClient = new NvcfAssetClient();
