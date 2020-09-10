'use strict';
const MODEL_NAME = 'Label';
const { makeHashIdModelGetters } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId } = makeHashIdModelGetters(MODEL_NAME);
  const Label = sequelize.define(MODEL_NAME, {
    bbox: DataTypes.STRING(1000),
  }, { getterMethods: { id, hashId } });
  Label.associate = function(models) {
    // associations can be defined here
    Label.belongsTo(models.Image, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
    Label.belongsTo(models.Class, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
    Label.belongsTo(models.User);
  };
  Label.getRawId = getRawId;
  return Label;
};
