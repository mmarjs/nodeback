'use strict'

module.exports = function (sequelize, DataTypes) {
  var Rides = sequelize.define('Rides', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    driver: {
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
    seats: DataTypes.INTEGER(2),
    time: {
      type: DataTypes.STRING(28),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        Rides.belongsTo(models.Locations, {foreignKey: 'fromId', as: 'from'})
        Rides.belongsTo(models.Locations, {foreignKey: 'toId', as: 'to'})
        Rides.hasMany(models.RideRiders, { foreignKey: 'rideId' })
      }
    }
  })
  return Rides
}
