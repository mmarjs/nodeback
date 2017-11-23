'use strict'

module.exports = function (sequelize, DataTypes) {
  var Locations = sequelize.define('Locations', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    lng: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    englishName: DataTypes.STRING(100),
    arabicName: DataTypes.STRING(100),
    notes: DataTypes.STRING(250)
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        Locations.hasMany(models.RideAlerts, { foreignKey: 'fromId' })
        Locations.hasMany(models.RideAlerts, { foreignKey: 'toId' })
        Locations.hasMany(models.RegularRide, { foreignKey: 'fromId' })
        Locations.hasMany(models.RegularRide, { foreignKey: 'toId' })
      }
    }
  })
  return Locations
}
