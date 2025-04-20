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
    await queryInterface.createTable('account_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',  // Ensure that the 'companies' table exists
          key: 'id',  // Reference to the 'id' field of the 'companies' table
        },
        allowNull: true,  // Allow company_id to be nullable
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow name to be nullable
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,  // Default value for 'status' is 0 (active)
        comment: "0 active, 1 not active",  // Add a comment to clarify the meaning of the status
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
    await queryInterface.dropTable('account_types');

  }
};
