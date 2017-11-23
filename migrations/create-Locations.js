'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Locations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      lat: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      lng: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      englishName: Sequelize.STRING(100),
      arabicName: Sequelize.STRING(100),
      notes: Sequelize.STRING(250)
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Locations')
  }
}
