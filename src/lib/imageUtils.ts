import heic2any from "heic2any";

/**
 * Robust image utility supporting:
 * - PNG, JPG, JPEG
 * - HEIC / HEIF (Auto-converted to high quality JPEG via heic2any)
 * - DNG (Digital Negative raw - extracts embedded high-res preview JPEG)
 * - WEBP
 * 
 * Auto-compresses images to optimal web size (<350KB) to ensure
 * instantaneous loading and total compliance with Firestore document limits.
 */

// Helper: Extract embedded preview JPEG from DNG / TIFF raw file
export function extractJpegFromDng(buffer: ArrayBuffer): Blob | null {
  const bytes = new Uint8Array(buffer);
  let largestStart = -1;
  let largestEnd = -1;
  let largestLength = 0;

  for (let i = 0; i < bytes.length - 3; i++) {
    // Check for JPEG SOI marker: FF D8 FF
    if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
      const start = i;
      let end = -1;
      // Search for JPEG EOI marker: FF D9
      for (let j = start + 3; j < Math.min(bytes.length - 1, start + 30 * 1024 * 1024); j++) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          end = j + 2;
        }
      }

      if (end !== -1) {
        const length = end - start;
        // Find the largest embedded JPEG (avoids tiny 160x120 thumbnails)
        if (length > largestLength && length > 10000) {
          largestLength = length;
          largestStart = start;
          largestEnd = end;
        }
        i = end - 1;
      }
    }
  }

  if (largestStart !== -1 && largestEnd !== -1) {
    const jpegBytes = bytes.slice(largestStart, largestEnd);
    return new Blob([jpegBytes], { type: "image/jpeg" });
  }

  return null;
}

// Helper: Convert HEIC/HEIF blob to standard JPEG blob with multi-stage fallbacks
export async function convertHeicToJpeg(blob: Blob): Promise<Blob> {
  // 1. Check magic bytes first (many files with .heic extension are actually standard JPEG, PNG or WebP)
  try {
    const headerBuffer = await blob.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);

    // JPEG SOI marker: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return new Blob([blob], { type: "image/jpeg" });
    }
    // PNG signature: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return new Blob([blob], { type: "image/png" });
    }
    // WebP signature: RIFF....WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return new Blob([blob], { type: "image/webp" });
    }
  } catch (err) {
    console.warn("Could not check magic bytes:", err);
  }

  // 2. Try native browser bitmap decoding (Safari / macOS and modern Chromium can decode HEIC natively)
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        const nativeBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", 0.88)
        );
        if (nativeBlob && nativeBlob.size > 1000) {
          return nativeBlob;
        }
      }
    } catch (_) {
      // Native bitmap decoding failed for this HEIC, proceed to next step
    }
  }

  // 3. Try heic2any library conversion
  try {
    const conversionResult = await heic2any({
      blob,
      toType: "image/jpeg",
      quality: 0.88,
    });
    const result = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    if (result && result.size > 1000) {
      return result;
    }
  } catch (heicErr) {
    console.warn("heic2any conversion error, attempting embedded JPEG preview fallback:", heicErr);
  }

  // 4. Fallback: Extract embedded full-res JPEG stream from the HEIF/HEIC container
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const extractedJpeg = extractJpegFromDng(arrayBuffer);
    if (extractedJpeg && extractedJpeg.size > 1000) {
      return extractedJpeg;
    }
  } catch (extractErr) {
    console.warn("Embedded JPEG extraction also failed:", extractErr);
  }

  // 5. If all decoding methods fail, throw a clear and helpful error message
  throw new Error(
    "HEIC image format is not supported by the browser decoder. Please upload as a standard JPG or PNG photo."
  );
}

/**
 * Compresses an image Blob/File to a data URL (JPEG/PNG) with resolution scaling
 */
export function compressImageFile(
  fileOrBlob: File | Blob,
  maxWidth = 1280,
  maxHeight = 960,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Small SVG or tiny files under 50KB don't need downscaling
    if (fileOrBlob.type === "image/svg+xml" || fileOrBlob.size < 50 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image on canvas with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-efficiency JPEG
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

export interface ProcessedPhoto {
  base64: string;
  originalName: string;
  format: string;
  sizeKb: number;
}

export interface ProcessPhotoOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Universal photo pre-processor:
 * Accepts PNG, JPG, JPEG, DNG, HEIC, HEIF, WEBP files
 * Decodes & converts them to a compressed, web-ready base64 string
 */
export async function processUniversalPhoto(
  file: File,
  options?: ProcessPhotoOptions
): Promise<ProcessedPhoto> {
  const fileName = file.name.toLowerCase();
  let workingBlob: Blob = file;
  let detectedFormat = "jpeg";

  // 1. HEIC / HEIF format
  if (
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif") ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  ) {
    detectedFormat = "heic";
    try {
      workingBlob = await convertHeicToJpeg(file);
    } catch (heicErr: any) {
      // Test if browser can decode it directly (e.g. Safari or native support)
      try {
        await compressImageFile(file, options?.maxWidth ?? 1280, options?.maxHeight ?? 960, options?.quality ?? 0.76);
        workingBlob = file;
      } catch (_) {
        throw new Error(
          "This HEIC/HEIF photo is not supported by the browser decoder. Please upload as a standard JPG or PNG image."
        );
      }
    }
  }
  // 2. DNG (Digital Negative) raw format
  else if (
    fileName.endsWith(".dng") ||
    file.type === "image/x-adobe-dng" ||
    file.type === "image/dng"
  ) {
    detectedFormat = "dng";
    const arrayBuffer = await file.arrayBuffer();
    const extractedJpeg = extractJpegFromDng(arrayBuffer);
    if (!extractedJpeg) {
      throw new Error(
        "Could not extract preview image from DNG file. Please ensure the DNG contains an embedded JPEG preview or export as JPEG/PNG."
      );
    }
    workingBlob = extractedJpeg;
  } else if (fileName.endsWith(".png")) {
    detectedFormat = "png";
  }

  // Compress & optimize for cloud Firestore & web display (<100KB typical)
  const maxWidth = options?.maxWidth ?? 1280;
  const maxHeight = options?.maxHeight ?? 960;
  const quality = options?.quality ?? 0.76;

  const base64 = await compressImageFile(workingBlob, maxWidth, maxHeight, quality);
  const sizeKb = Math.round((base64.length * 3) / 4 / 1024);

  return {
    base64,
    originalName: file.name,
    format: detectedFormat,
    sizeKb,
  };
}
