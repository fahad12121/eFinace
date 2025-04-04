'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('company_users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies', // Referencing the 'companies' table
          key: 'id', // Primary key in the 'companies' table
        },
        allowNull: false, // Ensure company_id cannot be null
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // Referencing the 'users' table
          key: 'id', // Primary key in the 'users' table
        },
        allowNull: false, // Ensure user_id cannot be null
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Default value is the current timestamp
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,  // Default value is the current timestamp
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('company_users'); // Revert the migration by dropping the table

  }
};
