'use strict';
const MODEL_NAME = 'Project';
const { makeHashIdModelGetters } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId } = makeHashIdModelGetters(MODEL_NAME);
  const Project = sequelize.define(MODEL_NAME, {
    name: DataTypes.STRING,
    labelingType: DataTypes.INTEGER,
  }, { getterMethods: { id, hashId } });
  Project.associate = function(models) {
    // associations can be defined here
    Project.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
    Project.hasMany(models.Class);
    Project.hasMany(models.Image);
  };
  Project.getRawId = getRawId;
  return Project;
};
