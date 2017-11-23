'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      description: Sequelize.STRING(250)
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Categories')
  }
}
