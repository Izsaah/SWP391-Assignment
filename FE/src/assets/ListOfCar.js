/**
 * List of Car Images from Google Drive
 * Helper functions to convert Google Drive links to direct image URLs
 */

/**
 * Convert Google Drive share link to direct image URL
 * @param {string} driveLink - Google Drive share link (e.g., https://drive.google.com/file/d/FILE_ID/view?usp=drive_link)
 * @returns {string} - Direct image URL for use in <img> tags
 */
export const getDriveImageUrl = (driveLink) => {
  if (!driveLink) return null;
  
  // Extract file ID from Google Drive link
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
  const fileIdMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    
    // Google Drive images have CORS restrictions
    // Use lh3.googleusercontent.com which is more reliable for public files
    // This requires the file to be shared publicly ("Anyone with the link can view")
    // Format: https://lh3.googleusercontent.com/d/FILE_ID
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  
  // If already a processed link, return as is
  if (driveLink.includes('lh3.googleusercontent.com') || 
      driveLink.includes('uc?export=view') || 
      driveLink.includes('thumbnail') || 
      driveLink.includes('uc?export=download')) {
    return driveLink;
  }
  
  return driveLink;
};

/**
 * List of car images from Google Drive
 * Add your Google Drive links here
 * 
 * To add a new image:
 * 1. Get the Google Drive share link (format: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link)
 * 2. Add it to the carImages array below with the correct modelId and variantId
 */
const carImages = [
  // Car Images from Google Drive
  // NOTE: Please update modelId and variantId to match your database
  {
    id: 1,
    modelId: null, // TODO: Update with actual Model ID from database
    variantId: null, // TODO: Update with actual Variant ID from database
    name: 'Car Image 1',
    driveLink: 'https://drive.google.com/file/d/1kaOaZhKyBB52VnvVLi9jBKlFzry9yHEe/view?usp=drive_link',
  },
  {
    id: 2,
    modelId: null,
    variantId: null,
    name: 'Car Image 2',
    driveLink: 'https://drive.google.com/file/d/1FZ-VPW4JmV8lB34KJyZrqAbSUbImNFxp/view?usp=drive_link',
  },
  {
    id: 3,
    modelId: null,
    variantId: null,
    name: 'Car Image 3',
    driveLink: 'https://drive.google.com/file/d/1Lhco4eWqgNcKs3g4tdWR3OzEK4BjV86x/view?usp=drive_link',
  },
  {
    id: 4,
    modelId: null,
    variantId: null,
    name: 'Car Image 4',
    driveLink: 'https://drive.google.com/file/d/17XaSESaNe5htuRMwC6qGAEpskdU0RjKH/view?usp=drive_link',
  },
  {
    id: 5,
    modelId: null,
    variantId: null,
    name: 'Car Image 5',
    driveLink: 'https://drive.google.com/file/d/1VsH9TVzaU3jQvYWLXsHCyLWEcdOy1rkk/view?usp=drive_link',
  },
  {
    id: 6,
    modelId: null,
    variantId: null,
    name: 'Car Image 6',
    driveLink: 'https://drive.google.com/file/d/10U8F6hR1s9PxjIeXuONeWSS_I0lUhIgk/view?usp=drive_link',
  },
  {
    id: 7,
    modelId: null,
    variantId: null,
    name: 'Car Image 7',
    driveLink: 'https://drive.google.com/file/d/11EcmFgPI1j1DPCZjFLki8m9lDaCjo1lG/view?usp=drive_link',
  },
  {
    id: 8,
    modelId: null,
    variantId: null,
    name: 'Car Image 8',
    driveLink: 'https://drive.google.com/file/d/1adEskNZIzxu8WmOkd1stK8veX9wrm5Fm/view?usp=drive_link',
  },
  {
    id: 9,
    modelId: null,
    variantId: null,
    name: 'Car Image 9',
    driveLink: 'https://drive.google.com/file/d/1Vw19rcLDQoGu3vM_K9q72OQtsYE_393i/view?usp=drive_link',
  },
  {
    id: 10,
    modelId: null,
    variantId: null,
    name: 'Car Image 10',
    driveLink: 'https://drive.google.com/file/d/12McG1pQN-if-akDxptQIwu50XWyGScFh/view?usp=drive_link',
  },
  {
    id: 11,
    modelId: null,
    variantId: null,
    name: 'Car Image 11',
    driveLink: 'https://drive.google.com/file/d/1HiSWiK9JGa3G7wH0OaRFoe_XgnW-NpPl/view?usp=drive_link',
  },
  {
    id: 12,
    modelId: null,
    variantId: null,
    name: 'Car Image 12',
    driveLink: 'https://drive.google.com/file/d/13EuNbGf8R_c_Gw2PrhMX1-rdFVfxgIHy/view?usp=drive_link',
  },
  {
    id: 13,
    modelId: null,
    variantId: null,
    name: 'Car Image 13',
    driveLink: 'https://drive.google.com/file/d/13zC_wR-cU214KUSrzPrbN-Z5ok6hBcv-/view?usp=drive_link',
  },
  {
    id: 14,
    modelId: null,
    variantId: null,
    name: 'Car Image 14',
    driveLink: 'https://drive.google.com/file/d/1f3UZlX1FBaAdVWEbq2PqGx0VfEVgIJI8/view?usp=drive_link',
  },
  {
    id: 15,
    modelId: null,
    variantId: null,
    name: 'Car Image 15',
    driveLink: 'https://drive.google.com/file/d/1XurJxTThKUX9G9DooftWqVHeE4dlAR0A/view?usp=drive_link',
  },
  {
    id: 16,
    modelId: null,
    variantId: null,
    name: 'Car Image 16',
    driveLink: 'https://drive.google.com/file/d/1KS5AHGEo1XTXBiXZcSkxVmdAe6IVDexs/view?usp=drive_link',
  },
  {
    id: 17,
    modelId: null,
    variantId: null,
    name: 'Car Image 17',
    driveLink: 'https://drive.google.com/file/d/1ElWOJ630DtKN3KGESiGbtqOdEy4wHvJk/view?usp=drive_link',
  },
];

/**
 * Process car images array to generate direct URLs
 */
const processedCarImages = carImages.map(car => {
  const directUrl = getDriveImageUrl(car.driveLink) || car.driveLink;
  console.log('🖼️ Processing car image:', {
    id: car.id,
    modelId: car.modelId,
    variantId: car.variantId,
    driveLink: car.driveLink,
    directUrl: directUrl
  });
  return {
    ...car,
    directUrl: directUrl
  };
});

console.log('📦 Total processed images:', processedCarImages.length);
console.log('📦 Processed images:', processedCarImages);

/**
 * Get image URL by model ID
 * @param {number} modelId - Model ID
 * @returns {string|null} - Image URL or null if not found
 */
export const getImageByModelId = (modelId) => {
  const car = processedCarImages.find(c => c.modelId === modelId);
  return car ? car.directUrl : null;
};

/**
 * Get image URL by variant ID
 * @param {number} variantId - Variant ID
 * @returns {string|null} - Image URL or null if not found
 */
export const getImageByVariantId = (variantId) => {
  const car = processedCarImages.find(c => c.variantId === variantId);
  return car ? car.directUrl : null;
};

/**
 * Get image URL by model and variant ID
 * @param {number} modelId - Model ID
 * @param {number} variantId - Variant ID
 * @returns {string|null} - Image URL or null if not found
 */
export const getImageByModelAndVariant = (modelId, variantId) => {
  const car = processedCarImages.find(c => c.modelId === modelId && c.variantId === variantId);
  return car ? car.directUrl : null;
};

/**
 * Get a random image from ListOfCar (useful as fallback)
 * @returns {string|null} - Random image URL or null if no images available
 */
export const getRandomImage = () => {
  if (processedCarImages.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * processedCarImages.length);
  return processedCarImages[randomIndex].directUrl;
};

/**
 * Get image by index (useful for consistent fallback)
 * @param {number} index - Index of the image (0-based)
 * @returns {string|null} - Image URL or null if index is out of range
 */
export const getImageByIndex = (index) => {
  if (index < 0 || index >= processedCarImages.length) return null;
  return processedCarImages[index].directUrl;
};

/**
 * Get first available image (useful as fallback)
 * @returns {string|null} - First image URL or null if no images available
 */
export const getFirstImage = () => {
  if (processedCarImages.length === 0) return null;
  return processedCarImages[0].directUrl;
};

/**
 * Get all car images
 * @returns {Array} - Array of processed car images with direct URLs
 */
export const getAllCarImages = () => {
  return processedCarImages;
};

/**
 * Add a new car image
 * @param {Object} carImage - Car image object { id, modelId, variantId, name, driveLink }
 */
export const addCarImage = (carImage) => {
  carImages.push(carImage);
  processedCarImages.push({
    ...carImage,
    directUrl: getDriveImageUrl(carImage.driveLink) || carImage.driveLink
  });
};

// Default export
export default {
  getDriveImageUrl,
  getImageByModelId,
  getImageByVariantId,
  getImageByModelAndVariant,
  getRandomImage,
  getImageByIndex,
  getFirstImage,
  getAllCarImages,
  addCarImage,
  carImages: processedCarImages
};

