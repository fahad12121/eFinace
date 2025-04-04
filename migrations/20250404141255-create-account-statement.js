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
    await queryInterface.createTable('account_statements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',  // Ensure that the 'users' table exists
          key: 'id',  // Reference to the 'id' field of the 'users' table
        },
        allowNull: true,
        onDelete: 'SET NULL',  // Optionally handle deletion behavior for foreign key
      },
      other_user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',  // Ensure that the 'users' table exists
          key: 'id',  // Reference to the 'id' field of the 'users' table
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'transactions',  // Ensure that the 'transactions' table exists
          key: 'id',  // Reference to the 'id' field of the 'transactions' table
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      sub_account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sub_accounts',  // Ensure that the 'sub_accounts' table exists
          key: 'id',  // Reference to the 'id' field of the 'sub_accounts' table
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      other_sub_account_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'sub_accounts',  // Ensure that the 'sub_accounts' table exists
          key: 'id',  // Reference to the 'id' field of the 'sub_accounts' table
        },
        allowNull: true,
        onDelete: 'SET NULL',
      },
      transaction_date: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow null if not provided
      },
      amount: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow null if not provided
      },
      balance: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,  // Default to 0
      },
      narration: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow null if not provided
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow null if not provided
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'companies',  // Ensure that the 'companies' table exists
          key: 'id',  // Reference to the 'id' field of the 'companies' table
        },
        allowNull: true,
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('account_statements');
  }
};
