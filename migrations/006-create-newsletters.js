const { Sequelize } = require('sequelize');

module.exports = {
  up: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    
    await queryInterface.createTable('newsletters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('subscribed', 'unsubscribed', 'bounced'),
        defaultValue: 'subscribed',
      },
      subscriptionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      preferences: {
        type: Sequelize.JSON,
        defaultValue: {
          frequency: 'weekly',
          categories: [],
        },
      },
      unsubscribeDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      unsubscribeReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lastEmailSent: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      emailsReceived: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('newsletters', ['email'], { unique: true });
    await queryInterface.addIndex('newsletters', ['status']);
    await queryInterface.addIndex('newsletters', ['isActive']);
  },

  down: async (sequelize) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('newsletters');
  },
};
