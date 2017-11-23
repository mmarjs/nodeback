'use strict'

module.exports = function (sequelize, DataTypes) {
  var Users = sequelize.define('Users', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    firstName: DataTypes.STRING(50),
    lastName: DataTypes.STRING(50),
    gender: DataTypes.BOOLEAN,
    picture: DataTypes.BLOB,
    cellphone: DataTypes.STRING(20),
    ridesWith: DataTypes.INTEGER(20),
    email: DataTypes.STRING(50),
    encPassword: DataTypes.STRING(100),
    status: DataTypes.STRING(20)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return Users
}
