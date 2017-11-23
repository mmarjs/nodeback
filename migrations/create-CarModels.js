'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('CarModels', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(35),
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER(4)
      },
      makeId: {
        type: Sequelize.UUID,
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('CarModels')
  }
}
