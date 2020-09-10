const asyncHandler = require('express-async-handler');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const ENDPOINT = process.env['MTM_API_ENDPOINT'];
const API_KEY = process.env['MTM_API_KEY'];
const AUTH_KEY = process.env['AUTH_KEY'];

module.exports = (app, db) => {
  const loginUrl = `${ENDPOINT}/api/v1/mtm_users/signin?apikey=${API_KEY}`;
  const authUrl = `${ENDPOINT}/api/v1/mtm_users/auth?apikey=${API_KEY}`;
  const meUrl = `${ENDPOINT}/api/v1/mtm_users/me?apikey=${API_KEY}`;

  app.post('/api/v1/login', asyncHandler(async (req, res) => {
    const { account, password } = req.body;
    if (!account || !password) {
      res.status(400).json({ message: 'bad request' });
      return;
    }
    try {
      // login to mtm first
      const loginResp = await axios.post(loginUrl, { account, password });
      const { account: mtmAccount, auth_token } = loginResp.data;
      // get access token from mtm
      const authResp = await axios.post(authUrl, { account: mtmAccount, auth_token });
      const { access_token } = authResp.data;
      // get user company info with access token
      const meResp = await axios.get(meUrl, { headers: { 'X-Mtm-User-Access-Token': access_token } });
      const { company } = meResp.data;
      const { id, name: companyName } = company;
      // find or create user's company
      const companyQuery = { where: { recipeId: id }, defaults: { name: companyName } };
      const [ companyInstance ] = await db.Company.findOrCreate(companyQuery);
      const companyRawId = companyInstance.getDataValue('id');
      // find or create user
      const userQuery = {
        where: { account: mtmAccount },
        defaults: { loginAt: new Date(), CompanyId: companyRawId },
      };
      const [ userInstance, userCreated ] = await db.User.findOrCreate(userQuery);
      if (!userCreated) {
        await userInstance.update({ loginAt: new Date() });
      }
      // prepare and sign the jwt payload
      const payload = {
        userId: userInstance.id,
        userAccount: userInstance.account,
        companyId: companyInstance.id,
      };
      const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 12); // 12 hours from now
      const token = jwt.sign({ payload, exp }, AUTH_KEY);
      // send it back finally
      res.json({ token });
    } catch (e) {
      const { response = {} } = e;
      console.error(e.message);
      res.status(response.status || 500).json({ message: e.message });
    }
  }));
};
