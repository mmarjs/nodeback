'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('UserCars', {
      userId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      modelId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      colorCode: Sequelize.STRING(7),
      plateNumber: Sequelize.STRING(8)
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('UserCars')
  }
}
