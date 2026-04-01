const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'YouTube, Vimeo, or custom video URL',
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Optional custom thumbnail image URL',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Video duration in seconds',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Video category (e.g., "Wellness", "Tutorial", "Testimonial")',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'published',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Order in which videos are displayed',
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Mark video as featured/highlighted',
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata (platform, video ID, etc.)',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'videos',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['featured'],
    },
    {
      fields: ['displayOrder'],
    },
  ],
});

module.exports = Video;
