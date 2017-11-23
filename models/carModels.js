'use strict'

module.exports = function (sequelize, DataTypes) {
  var CarModels = sequelize.define('CarModels', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(35),
      allowNull: false
    },
    year: DataTypes.INTEGER(4),
    makeId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        CarModels.hasMany(models.UserCars, { foreignKey: 'modelId' })
      }
    }
  })
  return CarModels
}
