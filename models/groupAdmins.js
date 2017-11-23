'use strict'

module.exports = function (sequelize, DataTypes) {
  var GroupAdmins = sequelize.define('GroupAdmins', {
    groupId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        GroupAdmins.belongsTo(models.Groups, {foreignKey: 'groupId', as: 'group'})
        GroupAdmins.belongsTo(models.Users, {foreignKey: 'userId', as: 'user'})
      }
    }
  })
  return GroupAdmins
}
