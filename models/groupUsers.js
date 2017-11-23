'use strict'

module.exports = function (sequelize, DataTypes) {
  var GroupUsers = sequelize.define('GroupUsers', {
    groupId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending'
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        GroupUsers.belongsTo(models.Groups, {foreignKey: 'groupId', as: 'group'})
        GroupUsers.belongsTo(models.Users, {foreignKey: 'userId', as: 'user'})
      }
    }
  })
  return GroupUsers
}
