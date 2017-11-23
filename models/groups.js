'use strict'

module.exports = function (sequelize, DataTypes) {
  var Groups = sequelize.define('Groups', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending'
    },
    icon: {
      type: DataTypes.STRING(100)
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        Groups.belongsTo(models.Categories, {foreignKey: 'categoryId', as: 'category'})
      }
    }
  })
  return Groups
}
