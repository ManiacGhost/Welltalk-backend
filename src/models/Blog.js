const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Category = require('./Category');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id',
    },
    allowNull: true,
  },
  featuredImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  readingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
  },
  seoTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  focusKeyword: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
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
  tableName: 'blogs',
  timestamps: true,
});

Blog.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Blog, { foreignKey: 'categoryId', as: 'blogs' });

module.exports = Blog;
