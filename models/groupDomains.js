'use strict'

module.exports = function (sequelize, DataTypes) {
  var GroupDomains = sequelize.define('GroupDomains', {
    domain: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return GroupDomains
}
