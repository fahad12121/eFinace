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
    await queryInterface.createTable('accessibilities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      viewable_accounts: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: [],
      },
      accounts: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: {
          view_only: false,
          edit: false,
          add: false,
        },
      },
      transactions: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: {
          view_only: false,
          edit: false,
          add: false,
        },
      },
      account_types: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: {
          view_only: false,
          add: false,
        },
      },
      balance_sheet: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: {
          view_only: false,
        },
      },
      import: {
        type: Sequelize.JSON,  // Use JSON for MySQL
        defaultValue: {
          add: false,
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
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
    await queryInterface.dropTable('accessibilities');

  }
};
