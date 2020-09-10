'use strict';
const MODEL_NAME = 'Company';
const { makeHashIdModelGetters } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId } = makeHashIdModelGetters(MODEL_NAME);
  const Company = sequelize.define(MODEL_NAME, {
    recipeId: DataTypes.STRING,
    name: DataTypes.STRING,
  }, { getterMethods: { id, hashId } });
  Company.associate = function(models) {
    // associations can be defined here
    Company.hasMany(models.Project);
    Company.hasMany(models.User);
  };
  Company.getRawId = getRawId;
  return Company;
};
