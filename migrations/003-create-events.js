'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
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
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      eventDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      eventTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      organizerName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ticketLink: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      coverImage: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      galleryImages: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'completed', 'cancelled'),
        defaultValue: 'upcoming',
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
    await queryInterface.addIndex('events', ['slug']);
    await queryInterface.addIndex('events', ['eventDate']);
    await queryInterface.addIndex('events', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('events');
  },
};
