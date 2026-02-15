import { storage } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// ==========================================
// 💾 LOCAL STORAGE / BASE64 IMAGE SERVICE
// ==========================================

export const uploadImage = async (userId: string, dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image object to load the data
      const img = new Image();
      img.src = dataUrl;
      
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (Max 800px to keep size low for LocalStorage/Firestore)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 0.6 quality (Good balance for mobile/web)
        // This keeps the string size manageable for Firestore/LocalStorage text fields
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        console.log("Image compressed for Local Storage.");
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => {
        console.error("Image compression error", err);
        // Fallback to original if compression fails (though risky for size)
        resolve(dataUrl);
      };

    } catch (error) {
      console.error("Storage Error:", error);
      reject(new Error("File processing failed"));
    }
  });
};

export const checkStorageLimit = (currentUsageBytes: number) => {
  // Not strictly used for Base64 storage, but kept for compatibility
  const MAX_STORAGE = 5 * 1024 * 1024; // 5 MB LocalStorage limit standard
  return currentUsageBytes < MAX_STORAGE;
};