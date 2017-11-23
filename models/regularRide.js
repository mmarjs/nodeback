'use strict'

module.exports = function (sequelize, DataTypes) {
  var RegularRide = sequelize.define('RegularRide', {
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
    leave: DataTypes.STRING(10),
    return: DataTypes.STRING(10),
    seatsLeaving: DataTypes.INTEGER(2),
    seatsReturning: DataTypes.INTEGER(2),
    daysOfWeek: {
      type: DataTypes.STRING(28),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        RegularRide.belongsTo(models.Locations, {foreignKey: 'fromId', as: 'from'})
        RegularRide.belongsTo(models.Locations, {foreignKey: 'toId', as: 'to'})
      }
    }
  })
  return RegularRide
}
