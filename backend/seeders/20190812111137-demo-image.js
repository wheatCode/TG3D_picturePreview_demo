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
    const fakeImageUrls = ['6XHlVbV', 'fHyEMsl', 'Fa21isY'];
    const records = new Array(80).fill(0).map((i, index) => ({
      fileName: `Test Image ${index + 1}`,
      filePath: `https://i.imgur.com/${fakeImageUrls[index % 3]}.jpg`,
      ProjectId: (index % 2) + 1,
      status: (index + 1) === 80 ? 2 : 1,
      md5: '123123123123sdasdad',
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      dispatchedAt: null,
    }));
    records.push({
      fileName: `An labeled image`,
      filePath: `https://i.imgur.com/${fakeImageUrls[0]}.jpg`,
      ProjectId: 1,
      status: 2,
      md5: '123123123123sdasdad',
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      dispatchedAt: null,
    });
    records.push({
      fileName: 'ImageA',
      filePath: `https://i.imgur.com/${fakeImageUrls[0]}.jpg`,
      ProjectId: 51,
      status: 1,
      md5: '123123123123sdasdad',
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      dispatchedAt: null,
    });
    return queryInterface.bulkInsert('Images', records);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Images', null, {});
  }
};
