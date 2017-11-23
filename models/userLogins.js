'use strict'

module.exports = function (sequelize, DataTypes) {
  var UserLogins = sequelize.define('UserLogins', {
    deviceId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    deviceName: DataTypes.STRING(20),
    loginToken: DataTypes.STRING(64)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return UserLogins
}
