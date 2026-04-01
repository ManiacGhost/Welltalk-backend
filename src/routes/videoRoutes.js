const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Validation middleware
const validateVideo = [
  body('title')
    .notEmpty()
    .withMessage('Video title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('videoUrl')
    .notEmpty()
    .withMessage('Video URL is required')
    .isURL()
    .withMessage('Invalid video URL format'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a positive number'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

/**
 * ⚠️ IMPORTANT: Specific routes must be BEFORE parameter routes (/:id)
 * to avoid route conflicts
 */

/**
 * Public Routes
 */

// Get featured videos (for homepage) - MUST be before /:id
router.get('/featured', videoController.getFeaturedVideos);

// Search videos - MUST be before /:id
router.get('/search', videoController.searchVideos);

// Get video statistics (Admin) - MUST be before /:id
router.get('/stats', videoController.getVideoStats);

// Get videos by category - MUST be before /:id
router.get('/category/:category', videoController.getVideosByCategory);

// Get all videos with filters and pagination
router.get('/', videoController.getAllVideos);

// Get single video by ID - MUST be last among GET routes
router.get('/:id', videoController.getVideoById);


/**
 * Admin Routes (Protected)
 * Note: Add authentication middleware here in production
 * Example: router.post('/', authenticateAdmin, validateVideo, videoController.createVideo);
 */

// Create new video (Admin)
router.post('/', validateVideo, videoController.createVideo);

// Update video (Admin)
router.put('/:id', validateVideo, videoController.updateVideo);

// Reorder videos (Admin)
router.put('/reorder', videoController.reorderVideos);

// Delete video (Admin)
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
