'use strict';
const MODEL_NAME = 'Class';
const { makeHashIdModelGetters } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId } = makeHashIdModelGetters(MODEL_NAME);
  const Class = sequelize.define(MODEL_NAME, {
    name: DataTypes.STRING
  }, { getterMethods: { id, hashId } });
  Class.associate = function(models) {
    // associations can be defined here
    Class.belongsTo(models.Project, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
    Class.hasMany(models.Label);
  };
  Class.getRawId = getRawId;
  return Class;
};
