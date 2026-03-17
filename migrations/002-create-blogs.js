'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      author: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      featuredImage: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      readingTime: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'draft',
      },
      seoTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      seoDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      focusKeyword: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('blogs', ['slug']);
    await queryInterface.addIndex('blogs', ['categoryId']);
    await queryInterface.addIndex('blogs', ['status']);
    await queryInterface.addIndex('blogs', ['publishedAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blogs');
  },
};
