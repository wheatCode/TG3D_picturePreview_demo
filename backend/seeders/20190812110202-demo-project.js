'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const records = new Array(50).fill(0).map((p, index) => ({
      name: `Test Project Type ${index + 1}`,
      CompanyId: index > 47 ? 2 : 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      labelingType: index % 2,
    }));
    records.push({
      name: 'ProjectWithOnly1Images',
      CompanyId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      labelingType: 0,
    });
    return queryInterface.bulkInsert('Projects', records);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Projects', null, {});
  }
};
