/**
 * Image optimization utility for shoe catalog listings.
 * Resizes large high-resolution device photos down to web-optimized dimensions
 * and compresses them so they load instantaneously and never exceed browser storage quotas.
 */

export async function optimizeImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic file extension / type safety check
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.jfif', '.heic'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
    const isImageMime = file.type.startsWith('image/');

    if (!isImageMime && !hasValidExt && file.type !== '') {
      return reject(new Error('Please select an image file (JPG, PNG, WEBP, etc.)'));
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file from device gallery'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('Could not parse image data'));
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio preserving resize
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original dataUrl if canvas context not available
            return resolve(dataUrl);
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill with clean neutral background for transparent PNGs if desired or just draw
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to efficient JPEG
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        } catch (err) {
          console.warn('Canvas optimization failed, using original data', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error('Could not decode image. Please check the file format.'));
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether an external Image URL can be loaded successfully by the browser.
 */
export function validateImageUrl(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') return resolve(false);

    // If it's already a data URL, test regex
    if (url.startsWith('data:image/')) return resolve(true);

    // Simple URL sanity check
    try {
      new URL(url);
    } catch {
      return resolve(false);
    }

    const img = new Image();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      resolve(false);
    }, timeoutMs);

    img.onload = () => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!timedOut) {
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}
