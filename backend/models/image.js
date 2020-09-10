'use strict';
const MODEL_NAME = 'Image';
const { makeHashIdModelGetters } = require('../utils');

const NON_PUBLIC_FIELDS = ['deleted'];

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId, json } = makeHashIdModelGetters(MODEL_NAME, NON_PUBLIC_FIELDS);
  const Image = sequelize.define(MODEL_NAME, {
    fileName: DataTypes.STRING,
    filePath: DataTypes.STRING(500),
    status: DataTypes.INTEGER,
    md5: DataTypes.STRING,
    deleted: DataTypes.BOOLEAN,
    dispatchedAt: DataTypes.DATE,
  }, { getterMethods: { id, hashId, json } });
  Image.associate = function(models) {
    // associations can be defined here
    Image.belongsTo(models.Project, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
    Image.hasMany(models.Label);
  };
  Image.getRawId = getRawId;
  return Image;
};
