'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    // Add seeder function here
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserCars', null, {})
  }
}
