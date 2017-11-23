'use strict'

module.exports = function (sequelize, DataTypes) {
  var AppFeedback = sequelize.define('AppFeedback', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER(1)
    },
    feedbackText: DataTypes.STRING(250)
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return AppFeedback
}
