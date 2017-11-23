'use strict'

module.exports = function (sequelize, DataTypes) {
  var Settings = sequelize.define('Settings', {
    skey: {
      type: DataTypes.STRING(40),
      primaryKey: true,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return Settings
}
