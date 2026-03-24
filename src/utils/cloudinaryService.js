const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} folder - Cloudinary folder path (e.g., 'welltalk/blogs', 'welltalk/events')
 * @param {string} resourceType - Resource type ('image', 'auto', etc.)
 * @returns {Promise<Object>} Cloudinary response with URL
 */
const uploadToCloudinary = (buffer, fileName, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        overwrite: false,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          logger.info(`Image uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload featured/thumbnail image to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} type - Type of content ('blog', 'article', 'event')
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadFeaturedImage = async (buffer, fileName, type = 'blogs') => {
  try {
    const folder = `welltalk/${type}/featured`;
    const result = await uploadToCloudinary(buffer, fileName, folder);
    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading featured image:', error);
    throw error;
  }
};

/**
 * Upload inline/body image to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} type - Type of content ('blog', 'article', 'event')
 * @returns {Promise<string>} Cloudinary secure URL
 */
const uploadInlineImage = async (buffer, fileName, type = 'blogs') => {
  try {
    const folder = `welltalk/${type}/inline`;
    const result = await uploadToCloudinary(buffer, fileName, folder);
    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading inline image:', error);
    throw error;
  }
};

/**
 * Upload gallery/multiple images to Cloudinary
 * @param {Buffer[]} buffers - Array of file buffers
 * @param {string[]} fileNames - Array of original filenames
 * @param {string} type - Type of content ('event', 'blog', 'article')
 * @returns {Promise<string[]>} Array of Cloudinary secure URLs
 */
const uploadGalleryImages = async (buffers, fileNames, type = 'events') => {
  try {
    const folder = `welltalk/${type}/gallery`;
    const uploadPromises = buffers.map((buffer, index) =>
      uploadToCloudinary(buffer, fileNames[index], folder)
    );

    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.secure_url);
  } catch (error) {
    logger.error('Error uploading gallery images:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary URL
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
    const urlParts = imageUrl.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split('.')[0];

    // Construct full public_id with folder
    const fullPublicId = urlParts
      .slice(urlParts.indexOf('upload') + 1)
      .join('/')
      .split('.')[0];

    const result = await cloudinary.uploader.destroy(fullPublicId);
    logger.info(`Image deleted from Cloudinary: ${imageUrl}`);
    return result;
  } catch (error) {
    logger.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadFeaturedImage,
  uploadInlineImage,
  uploadGalleryImages,
  deleteFromCloudinary,
};
