'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      userId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      firstName: Sequelize.STRING(50),
      lastName: Sequelize.STRING(50),
      gender: Sequelize.BOOLEAN,
      picture: Sequelize.BLOB,
      cellphone: Sequelize.STRING(20),
      ridesWith: Sequelize.INTEGER(1),
      email: Sequelize.STRING(50),
      encPassword: Sequelize.STRING(100),
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending email verification'
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users')
  }
}
