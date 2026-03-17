'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Sample data for categories
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Health',
        slug: 'health',
        description: 'Health and wellness articles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Medicine',
        slug: 'medicine',
        description: 'Medical information and research',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wellness',
        slug: 'wellness',
        description: 'Wellness tips and lifestyle',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Data',
        slug: 'data',
        description: 'Data and statistics',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Lifestyle articles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Seeded categories');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
