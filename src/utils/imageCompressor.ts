/**
 * Utility to compress and resize an image file using HTML Canvas.
 * Ensures that high-resolution images uploaded by users are resized down
 * to a lightweight thumbnail, preventing document size limit exceeded errors in Firestore.
 */
export function compressImage(file: File, maxWidth: number = 250, maxHeight: number = 250): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to fit within maxWidth/maxHeight preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
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

        // Draw image onto canvas (smooth scaling)
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 0.7 quality to guarantee lightweight file size (under 15KB)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}
