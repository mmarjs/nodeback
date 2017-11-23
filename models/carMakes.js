'use strict'

module.exports = function (sequelize, DataTypes) {
  var CarMakes = sequelize.define('CarMakes', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return CarMakes
}
