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
    // Adding 'is_favt' column to 'users' table
    await queryInterface.addColumn('users', 'is_favt', {
      type: Sequelize.BOOLEAN,  // Column data type set to BOOLEAN
      allowNull: false,         // Make it required
      defaultValue: false,       // Set a default value (optional)
      comment: 'is_favt = false, is_favt = true'  // Adding a comment to the column
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('users', 'is_favt');
  }
};
