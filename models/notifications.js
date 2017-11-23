'use strict'

module.exports = function (sequelize, DataTypes) {
  var Notifications = sequelize.define('Notifications', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        Notifications.belongsTo(models.Notifications)
      }
    }
  })
  return Notifications
}
