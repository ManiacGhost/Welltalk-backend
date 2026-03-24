const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadFeaturedImage,
  uploadInlineImage,
  uploadGalleryImages,
  deleteFromCloudinary,
} = require('../utils/cloudinaryService');
const logger = require('../utils/logger');

// Memory storage for multer (files stored in memory, not on disk)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10, // Maximum 10 files at once
  },
});

// Base route for testing
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload endpoints are available',
    endpoints: {
      featured: 'POST /api/v1/upload/featured',
      inline: 'POST /api/v1/upload/inline',
      gallery: 'POST /api/v1/upload/gallery',
      delete: 'DELETE /api/v1/upload/delete',
    },
  });
});

/**
 * Upload featured/thumbnail image
 * POST /api/v1/upload/featured
 * Body: file (single image), type (blogs|articles|events)
 */
router.post('/featured', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    // Get type from query or body (default to 'blogs')
    const type = req.body.type || req.query.type || 'blogs';

    const imageUrl = await uploadFeaturedImage(
      req.file.buffer,
      req.file.originalname,
      type
    );

    res.status(200).json({
      success: true,
      url: imageUrl,
      message: 'Featured image uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading featured image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading featured image',
      error: error.message,
    });
  }
});

/**
 * Upload inline/body image (used in rich text editors)
 * POST /api/v1/upload/inline
 * Body: file (single image), type (blogs|articles|events)
 */
router.post('/inline', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    // Get type from query or body (default to 'blogs')
    const type = req.body.type || req.query.type || 'blogs';

    const imageUrl = await uploadInlineImage(
      req.file.buffer,
      req.file.originalname,
      type
    );

    res.status(200).json({
      success: true,
      url: imageUrl,
      message: 'Inline image uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading inline image:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading inline image',
      error: error.message,
    });
  }
});

/**
 * Upload multiple gallery images
 * POST /api/v1/upload/gallery
 * Body: files (multiple images), type (events|blogs|articles)
 */
router.post('/gallery', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    // Get type from query or body (default to 'events')
    const type = req.body.type || req.query.type || 'events';

    const buffers = req.files.map((file) => file.buffer);
    const fileNames = req.files.map((file) => file.originalname);

    const imageUrls = await uploadGalleryImages(buffers, fileNames, type);

    res.status(200).json({
      success: true,
      urls: imageUrls,
      message: 'Gallery images uploaded successfully',
    });
  } catch (error) {
    logger.error('Error uploading gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading gallery images',
      error: error.message,
    });
  }
});

/**
 * Delete image from Cloudinary
 * DELETE /api/v1/upload/delete
 * Body: { imageUrl: "cloudinary-url" }
 */
router.delete('/delete', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }

    await deleteFromCloudinary(imageUrl);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
});

module.exports = router;
