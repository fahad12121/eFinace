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
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.BOOLEAN,  // Column data type set to BOOLEAN
      allowNull: false,         // Make it required
      defaultValue: false,       // Set a default value (optional)
      comment: '0 = active, 1 = suspended'  // Adding a comment to the column // You can set this to false if you want to require the field
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('users', 'status');

  }
};
