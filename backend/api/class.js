const asyncHandler = require('express-async-handler');
const Op = require('sequelize/lib/operators');

module.exports = (app, db) => {
  // get list of classes
  app.get('/api/v1/projects/:id/classes', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const projectRawId = db.Project.getRawId(id);
    if (!projectRawId) return res.status(404).end();

    const queryOptions = {
      where: { id: projectRawId, CompanyId: req.user.companyId },
    };
    const project = await db.Project.findOne(queryOptions);
    if (!project) return res.status(404).end();

    const classes = await project.getClasses();
    res.json({ classes });
  }));

  // add a class to a project
  app.post('/api/v1/projects/:id/classes', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const projectRawId = db.Project.getRawId(id);
    if (!projectRawId) return res.status(404).end();

    const { name } = req.body;
    if (!name) return res.status(400).end();

    const queryOptions = {
      where: { id: projectRawId, CompanyId: req.user.companyId },
    };
    const project = await db.Project.findOne(queryOptions);
    if (!project) return res.status(404).end();

    try {
      const createdClass = await db.Class.create({ name, ProjectId: projectRawId });
      res.json({ id: createdClass.id });
    } catch (e) {
      res.status(500).end();
    }
  }));

  // update a class
  app.post('/api/v1/projects/:pid/classes/:cid', asyncHandler(async (req, res) => {
    const { pid, cid } = req.params;
    const { name } = req.body;

    const projectRawId = db.Project.getRawId(pid);
    const classRawId = db.Class.getRawId(cid);
    if (!projectRawId || !classRawId) return res.status(404).end();

    const projectQuery = { where: { id: projectRawId, CompanyId: req.user.companyId } };
    const project = await db.Project.findOne(projectQuery);
    if (!project) return res.status(404).end();

    if (!name) return res.status(400).end();

    const classQuery = { where: { id: classRawId, ProjectId: projectRawId } };
    const [ success ] = await db.Class.update({ name }, classQuery);
    res.status(success ? 200 : 404).end();
  }));

  // delete a class
  // will also delete associated labels and reset image status if necessary
  app.delete('/api/v1/projects/:pid/classes/:cid', asyncHandler(async (req, res) => {
    const { pid, cid } = req.params;
    const projectRawId = db.Project.getRawId(pid);
    const classRawId = db.Class.getRawId(cid);
    if (!projectRawId || !classRawId) return res.status(404).end();

    const projectQuery = { where: { id: projectRawId, CompanyId: req.user.companyId } };
    const project = await db.Project.findOne(projectQuery);
    if (!project) return res.status(404).end();

    try {
      const classQuery = { where: { id: classRawId, ProjectId: projectRawId } };
      const success = await db.Class.destroy(classQuery);
      if (!success) return res.status(404).end();
      // remove associated labels with this class anyway
      await db.Label.destroy({ where: { ClassId: classRawId } });

      // Reset image status to 'Not-labeled' if it no longer has associated labels
      const imageQuery = {
        include: [{
          model: db.Label,
          required: false,
          attributes: ['id'],
        }],
        where: { status: 2, ProjectId: projectRawId, '$Labels.id$': null, deleted: false },
        required: false,
      };
      const images = await db.Image.findAll(imageQuery);
      if (images.length > 0) {
        const ids = images.map(i => i.getDataValue('id'));
        await db.Image.update({ status: 1 }, { where: { id: { [Op.in]: ids } } });
      }
      res.status(204).end();
    } catch (e) {
      console.log(e.message);
      res.status(500).end();
    }
  }));
};
