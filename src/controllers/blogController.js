const Blog = require('../models/Blog');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const normalizeUploadPath = (value) => {
  if (!value || typeof value !== 'string') return null;

  const raw = value.trim();
  if (!raw) return null;

  const uploadsIdx = raw.toLowerCase().indexOf('/uploads/');
  if (uploadsIdx >= 0) return raw.slice(uploadsIdx + 1).replace(/\\/g, '/');
  if (raw.toLowerCase().startsWith('uploads/')) return raw.replace(/\\/g, '/');
  return null;
};

const fileExists = async (relativePath) => {
  if (!relativePath) return false;
  const absolutePath = path.join(__dirname, '../../', relativePath);
  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const resolveImageWithInlineFallback = async (imagePath) => {
  const normalized = normalizeUploadPath(imagePath);
  if (!normalized) return imagePath || null;

  if (await fileExists(normalized)) return normalized;

  const fallbackPath = path.posix.join('uploads', 'inline', path.basename(normalized));
  if (await fileExists(fallbackPath)) return fallbackPath;

  return normalized;
};

const extractFirstImageFromContent = (content) => {
  if (!content || typeof content !== 'string') return null;

  const matches = content.match(/(?:https?:\/\/[^"'\s]+)?\/?uploads\/[^"'\s)]+/i);
  if (!matches || !matches[0]) return null;

  return normalizeUploadPath(matches[0]);
};

const enrichBlogImages = async (blog) => {
  const plain = typeof blog.toJSON === 'function' ? blog.toJSON() : blog;
  let resolvedFeaturedImage = await resolveImageWithInlineFallback(plain.featuredImage);

  // If featured image is missing, use first uploads image from the article content.
  if (!resolvedFeaturedImage) {
    const contentImage = extractFirstImageFromContent(plain.content);
    if (contentImage) {
      resolvedFeaturedImage = await resolveImageWithInlineFallback(contentImage);
    }
  }

  return {
    ...plain,
    featuredImage: resolvedFeaturedImage,
  };
};

// Get all blogs with pagination
const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoryId } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause - only return BLOGs, not ARTICLES
    const where = { flag_category: 'BLOG' };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      message: 'Blogs fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message,
    });
  }
};

// Get blog by ID or slug
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOne({
      where: { $or: [{ id }, { slug: id }] },
      include: [{ model: Category, as: 'category' }],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const blogWithResolvedImage = await enrichBlogImages(blog);

    res.status(200).json({
      success: true,
      data: blogWithResolvedImage,
    });
  } catch (error) {
    logger.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message,
    });
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Extract fields including flag_category
    const {
      title,
      slug,
      content,
      shortDescription,
      author,
      categoryId,
      readingTime,
      tags,
      status,
      seoTitle,
      seoDescription,
      focusKeyword,
      flag_category,
    } = req.body;

    // Validate categoryId if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${categoryId} does not exist`,
        });
      }
    }

    const bodyFeaturedImage = normalizeUploadPath(
      req.body.featuredImage || req.body.image || req.body.coverImage || req.body.thumbnail
    );
    const featuredImage = req.file
      ? path.join('uploads', 'blogs', req.file.filename)
      : bodyFeaturedImage;

    const blog = await Blog.create({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      content,
      shortDescription,
      author,
      categoryId,
      featuredImage,
      readingTime: readingTime || 5,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      status: status || 'draft',
      seoTitle,
      seoDescription,
      focusKeyword,
      flag_category: flag_category || 'BLOG',
      publishedAt: status === 'published' ? new Date() : null,
    });

    const blogWithCategory = await Blog.findByPk(blog.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json({
      success: true,
      data: blogWithCategory,
      message: 'Blog created successfully',
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message,
    });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      shortDescription,
      author,
      categoryId,
      readingTime,
      tags,
      status,
      seoTitle,
      seoDescription,
      focusKeyword,
      flag_category,
    } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${categoryId} does not exist`,
        });
      }
    }

    const bodyFeaturedImage = normalizeUploadPath(
      req.body.featuredImage || req.body.image || req.body.coverImage || req.body.thumbnail
    );
    const featuredImage = req.file
      ? path.join('uploads', 'blogs', req.file.filename)
      : bodyFeaturedImage;

    const updateData = {
      title: title || blog.title,
      slug: slug || blog.slug,
      content: content || blog.content,
      shortDescription: shortDescription || blog.shortDescription,
      author: author || blog.author,
      categoryId: categoryId || blog.categoryId,
      readingTime: readingTime || blog.readingTime,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : blog.tags,
      status: status || blog.status,
      seoTitle: seoTitle || blog.seoTitle,
      seoDescription: seoDescription || blog.seoDescription,
      focusKeyword: focusKeyword || blog.focusKeyword,
      flag_category: flag_category || blog.flag_category,
    };

    if (featuredImage) updateData.featuredImage = featuredImage;
    if (status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    await blog.update(updateData);

    const updatedBlog = await Blog.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(200).json({
      success: true,
      data: updatedBlog,
      message: 'Blog updated successfully',
    });
  } catch (error) {
    logger.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message,
    });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    await blog.destroy();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
