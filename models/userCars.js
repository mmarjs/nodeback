'use strict'

module.exports = function (sequelize, DataTypes) {
  var UserCars = sequelize.define('UserCars', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    modelId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    colorCode: DataTypes.STRING(7),
    plateNumber: DataTypes.STRING(8)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        UserCars.belongsTo(models.CarModels, {foreignKey: 'modelId', as: 'model'})
      }
    }
  })
  return UserCars
}
