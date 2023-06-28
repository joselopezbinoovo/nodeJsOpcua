'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ValoresPLC', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      variableString: {
        type: Sequelize.STRING
      },
      variableName: {
        type: Sequelize.STRING
      },
      conectionString: {
        type: Sequelize.STRING
      },
      id_variable: {
        type: Sequelize.INTEGER
      },

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ValoresPLC');
  }
};