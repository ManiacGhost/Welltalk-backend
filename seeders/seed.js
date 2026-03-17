require('dotenv').config();
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

// Import models
const Category = require('../src/models/Category');
const Blog = require('../src/models/Blog');
const Event = require('../src/models/Event');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    const [categories] = await sequelize.query(
      'SELECT * FROM categories'
    );

    if (categories.length === 0) {
      logger.info('Seeding categories...');
      const categoryData = [
        { name: 'Health', slug: 'health', description: 'Health and wellness articles' },
        { name: 'Medicine', slug: 'medicine', description: 'Medical information' },
        { name: 'Wellness', slug: 'wellness', description: 'Wellness tips and lifestyle' },
        { name: 'Data', slug: 'data', description: 'Data and statistics' },
        { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle articles' },
      ];

      for (const cat of categoryData) {
        await Category.create(cat);
      }
      logger.info('✅ Categories seeded');
    } else {
      logger.info('Categories already exist, skipping seed');
    }

    logger.info('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
