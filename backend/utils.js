const Hashids = require('hashids');
const camelCase = require('camelcase');

const HASH_SALT = process.env['HASH_SALT'];

const makeHashIdModelGetters = (modelName, nonPublicFields) => {
  const hashids = new Hashids(`${HASH_SALT} ${modelName}`, 8);
  return {
    id() {
      return this.hashId;
    },
    hashId() {
      return hashids.encode(this.getDataValue('id'));
    },
    getRawId(hashId) {
      return hashids.decode(hashId)[0];
    },
    json() {
      const data = { ...this.dataValues, id: this.id };
      // filter keys that are in the non-public list
      if (Array.isArray(nonPublicFields)) {
        Object.keys(data).forEach((k) => {
          if (nonPublicFields.indexOf(k) > -1) {
            delete data[k];
          }
        });
      }
      return data;
    }
  };
};

const makeOrderByParams = (sort, availableFields = []) => {
  let parsedSortKey = `${sort || ''}`.trim();
  const defaultOrder = ['id', 'ASC'];
  if (!parsedSortKey) return [defaultOrder];

  const isDesc = parsedSortKey.indexOf('-') === 0;
  parsedSortKey = camelCase(parsedSortKey);
  if (availableFields.indexOf(parsedSortKey) < 0) return [defaultOrder];

  return [[parsedSortKey, isDesc ? 'DESC' : 'ASC']];
};

const getYmd = () => {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return todayUTC.toISOString().slice(0, 10).replace(/-/g, '');
};

module.exports = {
  makeHashIdModelGetters,
  makeOrderByParams,
  getYmd,
};
