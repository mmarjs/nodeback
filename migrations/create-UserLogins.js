'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('UserLogins', {
      deviceId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      deviceName: Sequelize.STRING(20),
      loginToken: Sequelize.STRING(64)
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('UserLogins')
  }
}
