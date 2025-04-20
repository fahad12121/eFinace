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
    await queryInterface.createTable('sub_accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sub_account_pk: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,  // Ensure it's not null
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',  // Ensure the 'companies' table exists
          key: 'id',  // Reference to the 'id' field of the 'companies' table
        },
        allowNull: true,  // Allow company_id to be nullable
        onDelete: 'SET NULL',  // Optionally handle deletion behavior for foreign key
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',  // Ensure the 'users' table exists
          key: 'id',  // Reference to the 'id' field of the 'users' table
        },
        allowNull: true,  // Allow user_id to be nullable
        onDelete: 'SET NULL',  // Optionally handle deletion behavior for foreign key
      },
      account_type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'account_types',  // Ensure the 'account_types' table exists
          key: 'id',  // Reference to the 'id' field of the 'account_types' table
        },
        allowNull: true,  // Allow account_type_id to be nullable
        onDelete: 'SET NULL',  // Optionally handle deletion behavior for foreign key
      },
      account_username: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow account_username to be nullable
      },
      balance: {
        type: Sequelize.DECIMAL(20,2),
        defaultValue: 0,  // Default balance to 0
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow notes to be nullable
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,  // Default to false (not default)
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,  // Default to false (not deleted)
      },
      deleted_at: {
        type: Sequelize.DATE,
        defaultValue: null,  // Default to null when not deleted
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
    await queryInterface.dropTable('sub_accounts');  // Revert the migration by dropping the table

  }
};
