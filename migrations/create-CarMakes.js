'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('CarMakes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(40),
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('CarMakes')
  }
}
