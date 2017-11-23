'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Rides', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      driver: {
        type: Sequelize.UUID,
        allowNull: false
      },
      from: {
        type: Sequelize.UUID,
        allowNull: false
      },
      to: {
        type: Sequelize.UUID,
        allowNull: false
      },
      seats: Sequelize.INTEGER(2),
      time: {
        type: Sequelize.STRING(28),
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Rides')
  }
}
