/**
 * Image transformation utilities
 */

/**
 * Apply transformations to an image (rotation, flip)
 * @param {string} imageSrc - Base64 image source
 * @param {number} rotation - Rotation angle in degrees
 * @param {boolean} flipHorizontal - Whether to flip horizontally
 * @param {boolean} flipVertical - Whether to flip vertically
 * @returns {Promise<string>} - Transformed image as base64
 */
export const applyImageTransformations = (
  imageSrc,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate canvas size based on rotation
        const isRotated = rotation === 90 || rotation === 270;
        canvas.width = isRotated ? img.height : img.width;
        canvas.height = isRotated ? img.width : img.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context state
        ctx.save();

        // Move to center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply flips
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

        // Draw image centered
        ctx.drawImage(
          img,
          -img.width / 2,
          -img.height / 2,
          img.width,
          img.height
        );

        // Restore context state
        ctx.restore();

        // Get processed image
        const processedImage = canvas.toDataURL("image/jpeg");
        resolve(processedImage);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = imageSrc;
  });
};

/**
 * Download image from URL and convert to base64
 * @param {string} imageUrl - Image URL to download
 * @returns {Promise<string>} - Base64 image data
 */
export const downloadImageAsBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
};

/**
 * Calculate rotation angle for left rotation
 * @param {number} currentRotation - Current rotation angle
 * @returns {number} - New rotation angle
 */
export const calculateLeftRotation = (currentRotation) => {
  return (currentRotation - 90 + 360) % 360;
};

/**
 * Calculate rotation angle for right rotation
 * @param {number} currentRotation - Current rotation angle
 * @returns {number} - New rotation angle
 */
export const calculateRightRotation = (currentRotation) => {
  return (currentRotation + 90) % 360;
};

/**
 * Toggle horizontal flip
 * @param {boolean} currentFlip - Current horizontal flip state
 * @returns {boolean} - New horizontal flip state
 */
export const toggleHorizontalFlip = (currentFlip) => {
  return !currentFlip;
};

/**
 * Toggle vertical flip
 * @param {boolean} currentFlip - Current vertical flip state
 * @returns {boolean} - New vertical flip state
 */
export const toggleVerticalFlip = (currentFlip) => {
  return !currentFlip;
};

/**
 * Get image dimensions from base64 image
 * @param {string} imageSrc - Base64 image source
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Resize image to specific dimensions
 * @param {string} imageSrc - Base64 image source
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<string>} - Resized image as base64
 */
export const resizeImage = (imageSrc, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

/**
 * Base64 string'i File objesine dönüştürür
 * @param {string} base64String - Base64 encoded string (data:image/... formatında olabilir)
 * @param {string} filename - Dosya adı (varsayılan: "image.jpg")
 * @returns {File} File objesi
 */
export const base64ToFile = (base64String, filename = "image.jpg") => {
  // Base64 string'den data URL'i çıkar
  const base64Data = base64String.includes(",")
    ? base64String.split(",")[1]
    : base64String;

  // MIME type'ı base64 string'den çıkar
  const mimeType = getMimeTypeFromBase64(base64String);

  // Base64'ü binary'ye dönüştür
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // File objesi oluştur - doğru MIME type ile
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

/**
 * Base64 string'in geçerli bir image formatında olup olmadığını kontrol eder
 * @param {string} base64String - Kontrol edilecek string
 * @returns {boolean} Geçerli image formatında mı
 */
export const isValidBase64Image = (base64String) => {
  return (
    base64String &&
    typeof base64String === "string" &&
    base64String.startsWith("data:image")
  );
};

/**
 * Base64 string'den MIME type'ı çıkarır
 * @param {string} base64String - Base64 string
 * @returns {string} MIME type (örn: "image/jpeg")
 */
export const getMimeTypeFromBase64 = (base64String) => {
  if (base64String.includes(",")) {
    const mimeMatch = base64String.match(/data:([^;]+);/);
    if (mimeMatch && mimeMatch[1]) {
      return mimeMatch[1];
    }
  }
  // Varsayılan olarak image/jpeg döndür
  return "image/jpeg";
};

/**
 * File objesini base64 string'e dönüştürür
 * @param {File} file - File objesi
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Image dosyasının boyutunu kontrol eder
 * @param {File} file - File objesi
 * @param {number} maxSizeInMB - Maksimum boyut (MB)
 * @returns {boolean} Boyut uygun mu
 */
export const isImageSizeValid = (file, maxSizeInMB = 10) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Image dosyasının formatını kontrol eder
 * @param {File} file - File objesi
 * @param {string[]} allowedTypes - İzin verilen MIME type'lar
 * @returns {boolean} Format uygun mu
 */
export const isImageFormatValid = (
  file,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"]
) => {
  return allowedTypes.includes(file.type);
};
