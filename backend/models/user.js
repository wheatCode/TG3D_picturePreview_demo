'use strict';
const MODEL_NAME = 'User';
const { makeHashIdModelGetters } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const { id, hashId, getRawId } = makeHashIdModelGetters(MODEL_NAME);
  const User = sequelize.define(MODEL_NAME, {
    account: DataTypes.STRING,
    loginAt: DataTypes.DATE,
  }, { getterMethods: { id, hashId } });
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      },
    });
  };
  User.getRawId = getRawId;
  return User;
};
