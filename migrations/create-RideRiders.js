'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('RideRiders', {
      rideId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      userId: {
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
      riderRating: Sequelize.INTEGER(2),
      driverRating: Sequelize.INTEGER(2),
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('RideRiders')
  }
}
