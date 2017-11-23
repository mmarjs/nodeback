'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('GroupDomains', {
      domain: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      groupId: {
        type: Sequelize.UUID,
        allowNull: false
      }
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('GroupDomains')
  }
}
