'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('RideAlerts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false
      },
      from: {
        type: Sequelize.UUID,
        allowNull: false
      },
      to: {
        type: Sequelize.UUID,
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('RideAlerts')
  }
}
