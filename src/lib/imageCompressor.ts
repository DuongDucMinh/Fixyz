/**
 * Utility for client-side image compression using HTML5 Canvas.
 * Reduces raw screenshot files (which can be 4-10MB PNGs) down to lightweight WebP/JPEG (100-250KB)
 * while preserving high fidelity for text, UI icons, and layout inspection.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  mimeType: 'image/webp',
};

/**
 * Compresses an image File or Blob and returns a base64 Data URL.
 */
export async function compressImageFile(
  file: File | Blob,
  customOptions?: CompressionOptions
): Promise<string> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  // For non-image files or SVGs, read as-is
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return fileToDataUrl(file);
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let { width, height } = img;
        const maxW = options.maxWidth || 1920;
        const maxH = options.maxHeight || 1920;

        // If file is already smaller than 120KB and within dimensions, don't over-compress
        if (file.size > 0 && file.size < 120 * 1024 && width <= maxW && height <= maxH) {
          fileToDataUrl(file).then(resolve).catch(reject);
          return;
        }

        // Calculate aspect ratio preserving dimensions
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          // Fallback if canvas context fails
          fileToDataUrl(file).then(resolve).catch(reject);
          return;
        }

        // Fill background with white to avoid black backgrounds on transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL(options.mimeType, options.quality);
          // Check if browser supported webp (some older engines return image/png)
          if (options.mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', options.quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', options.quality);
        }

        resolve(dataUrl);
      } catch (err) {
        // Fallback to raw data url if canvas fails
        console.warn('[ImageCompressor] Compression failed, falling back to raw file', err);
        fileToDataUrl(file).then(resolve).catch(reject);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('[ImageCompressor] Image loading error, falling back to raw file', err);
      fileToDataUrl(file).then(resolve).catch(reject);
    };

    img.src = objectUrl;
  });
}

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
