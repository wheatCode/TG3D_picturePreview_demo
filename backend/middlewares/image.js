const asyncHandler = require('express-async-handler');

module.exports = (db) => (paramName = 'id') => asyncHandler(async (req, res, next) => {
  const id = req.params[paramName];
  const imageRawId = db.Image.getRawId(id);
  if (!imageRawId) return res.status(404).end();

  const options = { where: { id: imageRawId, ProjectId: req.projectRawId, deleted: false } };

  const record = await db.Image.findOne(options);
  if (!record) return res.status(404).end();

  req.image = record;
  req.imageRawId = imageRawId;
  next();
});
