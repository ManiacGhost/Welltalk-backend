const Blog = require('../models/Blog');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all blogs with pagination
const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoryId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const { count, rows } = await Blog.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
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

    res.status(200).json({
      success: true,
      data: blog,
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
    } = req.body;

    const featuredImage = req.file ? req.file.path : null;

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
    } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const featuredImage = req.file ? req.file.path : undefined;

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
