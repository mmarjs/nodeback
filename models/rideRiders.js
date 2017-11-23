'use strict'

module.exports = function (sequelize, DataTypes) {
  var RideRiders = sequelize.define('RideRiders', {
    rideId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
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
    },
    riderRating: DataTypes.INTEGER(2),
    driverRating: DataTypes.INTEGER(2),
    status: DataTypes.STRING(20)
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        RideRiders.belongsTo(models.Locations, {foreignKey: 'fromId', as: 'from'})
        RideRiders.belongsTo(models.Locations, {foreignKey: 'toId', as: 'to'})
        RideRiders.belongsTo(models.Rides, {foreignKey: 'rideId', as: 'ride'})
      }
    }
  })
  return RideRiders
}
