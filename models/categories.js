'use strict'

module.exports = function (sequelize, DataTypes) {
  var Categories = sequelize.define('Categories', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    description: DataTypes.STRING(250)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return Categories
}
