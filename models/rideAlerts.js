'use strict'

module.exports = function (sequelize, DataTypes) {
  var RideAlerts = sequelize.define('RideAlerts', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false
    },
    fromId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'from'
    },
    toId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'to'
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        RideAlerts.belongsTo(models.Locations, {foreignKey: 'fromId', as: 'from'})
        RideAlerts.belongsTo(models.Locations, {foreignKey: 'toId', as: 'to'})
      }
    }
  })
  return RideAlerts
}
