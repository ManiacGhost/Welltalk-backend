const Video = require('../models/Video');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Get all videos with filters and pagination
 * GET /api/v1/videos
 */
const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'published', featured, category, sortBy = 'displayOrder' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';
    if (category) where.category = category;

    // Determine sort order
    let order = [['displayOrder', 'ASC']];
    if (sortBy === 'newest') order = [['createdAt', 'DESC']];
    if (sortBy === 'oldest') order = [['createdAt', 'ASC']];
    if (sortBy === 'views') order = [['views', 'DESC']];

    const { count, rows: videos } = await Video.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      message: 'Videos fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message,
    });
  }
};

/**
 * Get featured videos (for homepage display)
 * GET /api/v1/videos/featured
 */
const getFeaturedVideos = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const videos = await Video.findAll({
      where: {
        status: 'published',
        featured: true,
      },
      order: [['displayOrder', 'ASC']],
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: videos,
      message: 'Featured videos fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching featured videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured videos',
      error: error.message,
    });
  }
};

/**
 * Get videos by category
 * GET /api/v1/videos/category/:category
 */
const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: videos } = await Video.findAndCountAll({
      where: {
        category,
        status: 'published',
      },
      order: [['displayOrder', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      message: `Videos in category "${category}" fetched successfully`,
    });
  } catch (error) {
    logger.error('Error fetching category videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category videos',
      error: error.message,
    });
  }
};

/**
 * Get single video by ID
 * GET /api/v1/videos/:id
 */
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Increment view count
    video.views = (video.views || 0) + 1;
    await video.save();

    res.status(200).json({
      success: true,
      data: video,
      message: 'Video fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message,
    });
  }
};

/**
 * Create new video (Admin)
 * POST /api/v1/videos
 */
const createVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, videoUrl, thumbnailUrl, duration, category, status, displayOrder, featured, tags } = req.body;

    // Extract video metadata from URL
    const metadata = extractVideoMetadata(videoUrl);

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration: duration ? parseInt(duration) : null,
      category,
      status: status || 'published',
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      featured: featured === 'true' || featured === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      metadata,
    });

    logger.info(`Video created: ${video.id}`);

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video created successfully',
    });
  } catch (error) {
    logger.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message,
    });
  }
};

/**
 * Update video (Admin)
 * PUT /api/v1/videos/:id
 */
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, thumbnailUrl, duration, category, status, displayOrder, featured, tags } = req.body;

    const video = await Video.findByPk(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Update fields if provided
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (videoUrl !== undefined) {
      video.videoUrl = videoUrl;
      video.metadata = extractVideoMetadata(videoUrl);
    }
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) video.duration = duration ? parseInt(duration) : null;
    if (category !== undefined) video.category = category;
    if (status !== undefined) video.status = status;
    if (displayOrder !== undefined) video.displayOrder = parseInt(displayOrder);
    if (featured !== undefined) video.featured = featured === 'true' || featured === true;
    if (tags !== undefined) {
      video.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    await video.save();

    logger.info(`Video updated: ${id}`);

    res.status(200).json({
      success: true,
      data: video,
      message: 'Video updated successfully',
    });
  } catch (error) {
    logger.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message,
    });
  }
};

/**
 * Delete video (Admin)
 * DELETE /api/v1/videos/:id
 */
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByPk(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    await video.destroy();

    logger.info(`Video deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message,
    });
  }
};

/**
 * Reorder videos (Admin)
 * PUT /api/v1/videos/reorder
 */
const reorderVideos = async (req, res) => {
  try {
    const { videoIds } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'videoIds array is required',
      });
    }

    // Update displayOrder for each video
    const updates = videoIds.map((id, index) =>
      Video.update({ displayOrder: index }, { where: { id } })
    );

    await Promise.all(updates);

    logger.info('Videos reordered successfully');

    res.status(200).json({
      success: true,
      message: 'Videos reordered successfully',
    });
  } catch (error) {
    logger.error('Error reordering videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering videos',
      error: error.message,
    });
  }
};

/**
 * Get video statistics (Admin)
 * GET /api/v1/videos/stats
 */
const getVideoStats = async (req, res) => {
  try {
    const totalVideos = await Video.count();
    const publishedVideos = await Video.count({ where: { status: 'published' } });
    const featuredVideos = await Video.count({ where: { featured: true, status: 'published' } });
    const draftVideos = await Video.count({ where: { status: 'draft' } });
    const archivedVideos = await Video.count({ where: { status: 'archived' } });

    const totalViews = await Video.sum('views');

    res.status(200).json({
      success: true,
      data: {
        totalVideos,
        publishedVideos,
        featuredVideos,
        draftVideos,
        archivedVideos,
        totalViews: totalViews || 0,
      },
      message: 'Video statistics fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching video stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video statistics',
      error: error.message,
    });
  }
};

/**
 * Helper function to extract metadata from video URL
 */
const extractVideoMetadata = (videoUrl) => {
  if (!videoUrl) return {};

  const metadata = {};

  // YouTube extraction
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = videoUrl.match(youtubeRegex);
  if (youtubeMatch) {
    metadata.platform = 'youtube';
    metadata.videoId = youtubeMatch[1];
    metadata.embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo extraction
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = videoUrl.match(vimeoRegex);
  if (vimeoMatch) {
    metadata.platform = 'vimeo';
    metadata.videoId = vimeoMatch[1];
    metadata.embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Generic embed URL
  if (!metadata.embedUrl) {
    metadata.platform = 'custom';
    metadata.embedUrl = videoUrl;
  }

  return metadata;
};

module.exports = {
  getAllVideos,
  getFeaturedVideos,
  getVideosByCategory,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  getVideoStats,
};
