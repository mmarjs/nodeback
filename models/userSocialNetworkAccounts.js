'use strict'

module.exports = function (sequelize, DataTypes) {
  var UserSocialNetworkAccounts = sequelize.define('UserSocialNetworkAccounts', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    accountKey: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    accountUsername: DataTypes.STRING(50),
    accessToken: DataTypes.STRING(200)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return UserSocialNetworkAccounts
}
