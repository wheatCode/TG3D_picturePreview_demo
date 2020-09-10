const jwt = require('jsonwebtoken');
const unless = require('express-unless');
const AUTH_KEY = process.env['AUTH_KEY'];

module.exports = function (db) {
  const myAuth = function (req, res, next) {
    const { authorization = '' } = req.headers;
    const token = authorization.split(' ')[1];
    if (!authorization || authorization.indexOf('Bearer ') !== 0 || !token) {
      console.log('Unable to authenticate user', authorization);
      return res.status(401).end();
    }
    jwt.verify(token, AUTH_KEY, (err, decoded) => {
      if (err) {
        console.log('token invalid', err.name);
        return res.status(401).end();
      } else {
        const { companyId, userId } = decoded.payload;
        const companyRawId = db.Company.getRawId(companyId);
        const userRawId = db.User.getRawId(userId);
        if (!companyRawId || !userRawId) return res.status(401).end();

        req.user = {
          ...decoded.payload,
          companyId: companyRawId,
          userId: userRawId,
        };
        next();
      }
    });
  };
  myAuth.unless = unless;
  return myAuth;
};
