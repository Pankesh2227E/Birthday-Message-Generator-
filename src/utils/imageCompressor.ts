/**
 * Client-Side Image Compressor
 * - Accepts every image file type (JPEG, PNG, WEBP, HEIC, GIF, AVIF, etc.)
 * - Skips compression if file size is already <= 300KB (for ANY image format)
 * - Compresses images > 300KB down to <= 300KB of JPEG
 * - Has an automatic 2-second timeout and failsafe fallback so uploads NEVER hang
 */

export async function compressImageTo300KB(file: File): Promise<File | Blob> {
  const MAX_BYTES = 300 * 1024; // 300 KB

  // If already <= 300KB, immediately skip compression and return as-is!
  if (file.size <= MAX_BYTES) {
    console.log(`[CLIENT-COMPRESSOR] Skipping: ${file.name} is already <= 300KB (${(file.size / 1024).toFixed(1)} KB)`);
    return file;
  }

  // Preserve animated GIFs
  if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
    return file;
  }

  // If HEIC / HEIF, browser canvas cannot decode it natively; pass directly to server's Sharp compressor
  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  ) {
    console.log(`[CLIENT-COMPRESSOR] HEIC file detected (${file.name}), handing off to server compressor`);
    return file;
  }

  return new Promise((resolve) => {
    // 2-second failsafe timeout: if canvas/FileReader hangs for any reason, resolve with original file immediately!
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn(`[CLIENT-COMPRESSOR] Timeout reached (2s). Passing original file to server compressor.`);
        resolve(file);
      }
    }, 2000);

    const safeResolve = (result: File | Blob) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(result);
      }
    };

    try {
      const reader = new FileReader();
      reader.onerror = () => safeResolve(file);
      reader.onload = () => {
        try {
          const img = new Image();
          img.onerror = () => safeResolve(file);
          img.onload = () => {
            try {
              let width = img.naturalWidth || img.width;
              let height = img.naturalHeight || img.height;

              // Downscale if image is larger than 1920px
              const MAX_DIMENSION = 1920;
              if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                  height = Math.round((height * MAX_DIMENSION) / width);
                  width = MAX_DIMENSION;
                } else {
                  width = Math.round((width * MAX_DIMENSION) / height);
                  height = MAX_DIMENSION;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                safeResolve(file);
                return;
              }

              // Fill white background for transparent PNGs
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);

              let quality = 0.82;

              const attemptCompression = () => {
                canvas.toBlob(
                  blob => {
                    try {
                      if (!blob) {
                        safeResolve(file);
                        return;
                      }

                      if (blob.size <= MAX_BYTES || quality <= 0.3) {
                        const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                        // Safely create File or fallback to Blob (for older WebKit/iOS versions)
                        try {
                          const compressedFile = new File([blob], newFileName, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                          });
                          safeResolve(compressedFile);
                        } catch {
                          safeResolve(blob);
                        }
                        return;
                      }

                      quality -= 0.15;
                      attemptCompression();
                    } catch {
                      safeResolve(file);
                    }
                  },
                  'image/jpeg',
                  quality
                );
              };

              attemptCompression();
            } catch {
              safeResolve(file);
            }
          };

          img.src = reader.result as string;
        } catch {
          safeResolve(file);
        }
      };

      reader.readAsDataURL(file);
    } catch {
      safeResolve(file);
    }
  });
}
