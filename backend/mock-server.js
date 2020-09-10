const nock = require('nock');
const __PROD__ = process.env['NODE_ENV'] === 'production';
const ENDPOINT = process.env['MTM_API_ENDPOINT'];
const API_KEY = process.env['MTM_API_KEY'];

const setupAPIMock = () => {
  const loginUrl = `/api/v1/mtm_users/signin?apikey=${API_KEY}`;
  const authUrl = `/api/v1/mtm_users/auth?apikey=${API_KEY}`;
  const meUrl = `/api/v1/mtm_users/me?apikey=${API_KEY}`;

  const account = 'test1@tg3ds.com';
  const password = 'tg3d1234';
  const recipeCompanyId = '3939889'; // should match with the one in seed files
  const auth_token = '3939889';
  const access_token = '3939889';
  nock(ENDPOINT)
  .persist()
  .post(loginUrl, { account, password })
  .reply(200, {
    account,
    auth_token,
  })
  .post(loginUrl)
  .reply(401)
  .post(authUrl, { account, auth_token })
  .reply(200, {
    access_token,
  })
  .get(meUrl)
  .reply(200, {
    company: { id: recipeCompanyId, name: 'TG3D Studio' },
  })
};

const setupS3Mock = () => {
  const s3Url = `https://${process.env['AWS_S3_BUCKET_NAME']}.s3-accelerate.amazonaws.com`;

  nock(s3Url)
  .persist()
  .head(uri => uri.includes('fake'))
  .reply(404)
  .head(uri => !uri.includes('fake'))
  .reply(200, null, {
    ETag: '"123123123"',
  });
};

const setupMock = () => {
  if (__PROD__) return;

  setupAPIMock();
  setupS3Mock();
};

module.exports = setupMock;
