require('dotenv').config();

module.exports = {
  'development': {
    'username': 'root',
    'password': null,
    'database': 'labeling_tool',
    'host': '127.0.0.1',
    'dialect': 'sqlite',
    'storage': './development.sqlite',
  },
  'test': {
    'username': 'root',
    'password': null,
    'database': 'labeling_tool',
    'host': '127.0.0.1',
    'dialect': 'sqlite',
    'storage': './test.sqlite',
  },
  'production': {
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD || null,
    'database': process.env.DB_NAME,
    'host': process.env.DB_HOST,
    'dialect': 'mysql',
    'define': {
      'charset': 'utf8mb4',
      'dialectOptions': {
        'collate': 'utf8mb4_general_ci',
        'ssl': 'Amazon RDS',
      },
    },
  },
};
