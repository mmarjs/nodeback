'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('RegularRide', {
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
      leave: Sequelize.STRING(10),
      return: Sequelize.STRING(10),
      seatsLeaving: Sequelize.INTEGER(2),
      seatsReturning: Sequelize.INTEGER(2),
      daysOfWeek: {
        type: Sequelize.STRING(28),
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('RegularRide')
  }
}
