'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Locations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      rideId: {
        type: Sequelize.STRING(36),
        allowNull: false
      },
      loginToken: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      timestamp: {
        type: Sequelize.STRING(28),
        allowNull: false
      },
      message: {
        type: Sequelize.STRING(36),
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Locations')
  }
}
