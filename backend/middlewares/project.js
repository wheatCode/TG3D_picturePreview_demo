const asyncHandler = require('express-async-handler');

module.exports = (db) => (paramName = 'id') => asyncHandler(async (req, res, next) => {
  const pid = req.params[paramName];
  const projectRawId = db.Project.getRawId(pid);
  if (!projectRawId) return res.status(404).end();

  const projectQueryOptions = {
    where: { id: projectRawId, CompanyId: req.user.companyId },
  };
  const project = await db.Project.findOne(projectQueryOptions);
  if (!project) return res.status(404).end();

  req.project = project;
  req.projectRawId = projectRawId;
  next();
});
