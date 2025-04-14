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
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      account_pk: {
        type: Sequelize.STRING,
        unique: true,
        defaultValue: null,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_type: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'User',
      },
      balance: {
        type: Sequelize.DECIMAL(20,2),
        defaultValue: 0,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',  // Ensure the 'companies' table exists
          key: 'id',
        },
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      last_ip: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'User',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
    await queryInterface.dropTable('users');
  }
};
