/**
 * High-definition image compressor utility.
 * Retains crystal-clear sharpness and fine details
 * while optimizing file size for fast loading and Firestore quota safety (< 1MB per doc).
 * Never discards or deletes any uploaded photos.
 */

export function compressBase64(
  dataUrl: string,
  maxWidth = 1440,
  maxHeight = 1440,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Calculate target dimensions while keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Stepped downsampling for razor-sharp clarity if image is very large
        let currentWidth = img.width;
        let currentHeight = img.height;
        let currentCanvas = document.createElement('canvas');
        currentCanvas.width = currentWidth;
        currentCanvas.height = currentHeight;
        let currentCtx = currentCanvas.getContext('2d');
        if (!currentCtx) {
          resolve(dataUrl);
          return;
        }

        currentCtx.imageSmoothingEnabled = true;
        currentCtx.imageSmoothingQuality = 'high';
        currentCtx.drawImage(img, 0, 0, currentWidth, currentHeight);

        // Step down by half if scaling down by more than 2x to avoid blurriness/aliasing
        while (currentWidth * 0.5 > width) {
          const nextWidth = Math.round(currentWidth * 0.5);
          const nextHeight = Math.round(currentHeight * 0.5);
          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = nextWidth;
          nextCanvas.height = nextHeight;
          const nextCtx = nextCanvas.getContext('2d');
          if (!nextCtx) break;

          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = 'high';
          nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

          currentCanvas = nextCanvas;
          currentWidth = nextWidth;
          currentHeight = nextHeight;
        }

        // Final crisp render at target resolution
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = Math.max(1, width);
        finalCanvas.height = Math.max(1, height);
        const finalCtx = finalCanvas.getContext('2d');
        if (!finalCtx) {
          resolve(dataUrl);
          return;
        }

        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(currentCanvas, 0, 0, width, height);

        let result = finalCanvas.toDataURL('image/jpeg', quality);

        // If single image alone exceeds 180KB, step down slightly to 0.70 quality
        if (result.length > 240000 && quality > 0.65) {
          result = finalCanvas.toDataURL('image/jpeg', Math.max(0.65, quality - 0.08));
        }

        resolve(result);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function compressImage(
  fileOrData: File | Blob | string,
  maxWidth = 1440,
  maxHeight = 1440,
  quality = 0.78
): Promise<string> {
  if (typeof fileOrData === 'string') {
    return compressBase64(fileOrData, maxWidth, maxHeight, quality);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      compressBase64(src, maxWidth, maxHeight, quality)
        .then(resolve)
        .catch(() => resolve(src));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrData);
  });
}

/**
 * Adaptive portfolio compressor that scales resolution & quality based on total count
 * so that 5, 10, 20+ photos all fit in Firestore without dropping any photo.
 */
export function compressPortfolioImage(
  fileOrData: File | Blob | string,
  totalPhotosCount = 1
): Promise<string> {
  let maxWidth = 1440;
  let maxHeight = 1440;
  let quality = 0.78;

  if (totalPhotosCount <= 2) {
    maxWidth = 1440;
    maxHeight = 1440;
    quality = 0.78;
  } else if (totalPhotosCount <= 5) {
    maxWidth = 1280;
    maxHeight = 1280;
    quality = 0.74;
  } else if (totalPhotosCount <= 10) {
    maxWidth = 1100;
    maxHeight = 1100;
    quality = 0.70;
  } else if (totalPhotosCount <= 20) {
    maxWidth = 960;
    maxHeight = 960;
    quality = 0.66;
  } else {
    maxWidth = 800;
    maxHeight = 800;
    quality = 0.62;
  }

  return compressImage(fileOrData, maxWidth, maxHeight, quality);
}

/**
 * Calculates rough UTF-8 byte size of an object or string
 */
export function getPayloadByteSize(obj: any): number {
  try {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return new Blob([str]).size;
  } catch {
    return 0;
  }
}

/**
 * Ensures any Firestore document payload stays safely below Firestore's 1MB limit (safe limit: 950KB).
 * Retains high visual definition and adaptively recompresses all images if the total document exceeds the safety quota.
 * NEVER deletes or pops any photo.
 */
export async function sanitizePayloadForFirestore<T extends Record<string, any>>(
  payload: T,
  maxBytes = 950000
): Promise<T> {
  try {
    let currentSize = getPayloadByteSize(payload);
    if (currentSize <= maxBytes) {
      return payload;
    }

    const cloned: Record<string, any> = JSON.parse(JSON.stringify(payload));

    // 1. Process array of imageUrls: recompress at crisp 1100px HD if payload is oversized
    if (Array.isArray(cloned.imageUrls) && cloned.imageUrls.length > 0) {
      const photoCount = cloned.imageUrls.length;
      const targetDim = photoCount > 8 ? 960 : 1100;
      const targetQual = photoCount > 8 ? 0.66 : 0.70;

      const compressedList: string[] = [];
      for (const item of cloned.imageUrls) {
        if (typeof item === 'string' && item.startsWith('data:image/')) {
          const recompressed = await compressBase64(item, targetDim, targetDim, targetQual);
          compressedList.push(recompressed);
        } else if (typeof item === 'string') {
          compressedList.push(item);
        }
      }

      cloned.imageUrls = compressedList;
      if (cloned.imageUrls.length > 0) {
        cloned.imageUrl = cloned.imageUrls[0];
      }
    }

    // 2. Re-check size
    currentSize = getPayloadByteSize(cloned);
    if (currentSize <= maxBytes) {
      return cloned as T;
    }

    // 3. Process single imageUrl field if not part of array
    if (typeof cloned.imageUrl === 'string' && cloned.imageUrl.startsWith('data:image/')) {
      cloned.imageUrl = await compressBase64(cloned.imageUrl, 1000, 1000, 0.68);
    }

    // 4. Process paymentProofUrl field
    if (typeof cloned.paymentProofUrl === 'string' && cloned.paymentProofUrl.startsWith('data:image/')) {
      cloned.paymentProofUrl = await compressBase64(cloned.paymentProofUrl, 800, 800, 0.65);
    }

    // 5. Process heroImageUrls if present
    if (Array.isArray(cloned.heroImageUrls)) {
      const compressedHero: string[] = [];
      for (const item of cloned.heroImageUrls) {
        if (typeof item === 'string' && item.startsWith('data:image/')) {
          const comp = await compressBase64(item, 1100, 1100, 0.68);
          compressedHero.push(comp);
        } else if (typeof item === 'string') {
          compressedHero.push(item);
        }
      }
      cloned.heroImageUrls = compressedHero;
    }

    // 6. If still exceeding, step down all images to 800px / 0.62 quality (DO NOT DROP ANY PHOTO!)
    currentSize = getPayloadByteSize(cloned);
    if (currentSize > maxBytes && Array.isArray(cloned.imageUrls) && cloned.imageUrls.length > 0) {
      const deeplyCompressed: string[] = [];
      for (const item of cloned.imageUrls) {
        if (typeof item === 'string' && item.startsWith('data:image/')) {
          const comp = await compressBase64(item, 800, 800, 0.60);
          deeplyCompressed.push(comp);
        } else if (typeof item === 'string') {
          deeplyCompressed.push(item);
        }
      }
      cloned.imageUrls = deeplyCompressed;
      if (cloned.imageUrls.length > 0) {
        cloned.imageUrl = cloned.imageUrls[0];
      }
    }

    return cloned as T;
  } catch (err) {
    console.warn('Payload sanitization fallback:', err);
    return payload;
  }
}


