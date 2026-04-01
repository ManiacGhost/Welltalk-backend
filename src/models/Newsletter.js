const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('subscribed', 'unsubscribed', 'bounced'),
    defaultValue: 'subscribed',
  },
  subscriptionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      frequency: 'weekly', // weekly, bi-weekly, monthly
      categories: [], // wellness, fitness, articles, etc.
    },
    comment: 'User subscription preferences',
  },
  unsubscribeDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  unsubscribeReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastEmailSent: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailsReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional subscriber metadata (source, IP, etc.)',
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
  tableName: 'newsletters',
  timestamps: true,
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

module.exports = Newsletter;
