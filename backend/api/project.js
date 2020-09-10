const asyncHandler = require('express-async-handler');
const Op = require('sequelize/lib/operators');
const { makeOrderByParams } = require('../utils');

const AVAILABLE_ORDER_FIELDS = ['name', 'labelingType', 'createdAt', 'updatedAt'];

module.exports = (app, db) => {
  const prepareProject = (record) => {
    const { name, labelingType, createdAt, updatedAt } = record.dataValues;
    const images = Array.isArray(record.Images) ? record.Images : [];
    const classes = Array.isArray(record.Classes) ? record.Classes : [];
    return {
      id: record.id,
      name,
      labelingType,
      createdAt,
      updatedAt,
      labeled: images.filter(i => i.status === 2).length,
      total: images.length,
      classes: classes.map(c => ({ id: c.id, name: c.name })),
    };
  };

  // get list of projects
  app.get('/api/v1/projects', asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0, sort = '' } = req.query;
    const options = {
      where: { CompanyId: req.user.companyId },
      // TODO: make completion rate sortable?
      // attributes: { include: [[db.sequelize.fn('COUNT', db.sequelize.col('hats')), 'completion']] },
      include: [
        { model: db.Image, attributes: ['status'], where: { deleted: false }, required: false },
        { model: db.Class, attributes: ['id', 'name'] },
      ],
      distinct: true,
      order: makeOrderByParams(sort, AVAILABLE_ORDER_FIELDS),
    };
    let filter = req.query.filter || '';
    filter = filter.trim();
    if (filter.length > 0) {
      options.where['name'] = { [Op.like]: `%${filter}%` };
    }
    options.limit = Math.max(Math.min(parseInt(limit, 10), 100), 0);
    options.offset = Math.max(parseInt(offset, 10), 0);
    const { count, rows } = await db.Project.findAndCountAll(options);
    // prepare the project lists
    const projects = rows.map(prepareProject);
    res.json({
      total: count,
      offset: options.offset,
      limit: options.limit,
      projects,
    });
  }));

  // get one project
  app.get('/api/v1/projects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const projectRawId = db.Project.getRawId(id);
    if (!projectRawId) return res.status(404).end();

    const query = {
      where: { id: projectRawId, CompanyId: companyId },
      include: [
        { model: db.Image, attributes: ['status'], where: { deleted: false }, required: false },
        { model: db.Class, attributes: ['id', 'name'] },
      ],
    };
    const result = await db.Project.findOne(query);
    if (!result) {
      res.status(404).end();
    } else {
      res.json(prepareProject(result));
    }
  }));

  // create project
  app.post('/api/v1/projects', asyncHandler(async (req, res) => {
    const { name, labelingType, classes } = req.body;
    if (
      !name ||
      (typeof labelingType !== 'number' || labelingType > 2 || labelingType < 0) ||
      (Array.isArray(classes) && classes.filter(c => c).length === 0)
    ) {
      res.status(400).end();
      return;
    }
    const project = await db.Project.create({
      name,
      labelingType: parseInt(labelingType, 10),
      CompanyId: req.user.companyId,
    });
    if (Array.isArray(classes)) {
      const classesToCreate = classes.filter(c => c);
      const projectRawId = db.Project.getRawId(project.id);
      if (classesToCreate.length > 0) {
        const data = classesToCreate.map(c => ({
          name: c,
          ProjectId: projectRawId,
        }));
        await db.Class.bulkCreate(data);
      }
    }
    res.json({ id: project.id });
  }));

  // update a project
  app.post('/api/v1/projects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, labelingType } = req.body;
    const data = {};
    if (name) data.name = name;
    if (labelingType >= 0 && labelingType <= 3) data.labelingType = parseInt(labelingType, 10);
    const projectRawId = db.Project.getRawId(id);
    if (!projectRawId) return res.status(404).end();
    if (!name && typeof labelingType !== 'number') return res.status(400).end();

    const query = { where: { id: projectRawId, CompanyId: req.user.companyId } };
    const projectInstance = await db.Project.findOne(query);
    if (!projectInstance) return res.status(404).end();

    // Cannot change labeling type after one of the images is labeled
    if (projectInstance.labelingType !== labelingType) {
      const labeledImage = await db.Image.findOne({ where: { status: 2, ProjectId: projectRawId, deleted: false } });
      if (labeledImage) return res.status(400).end();
    }

    const [ success ] = await db.Project.update(data, query);
    res.status(success ? 200 : 404).end();
  }));

  app.delete('/api/v1/projects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const projectRawId = db.Project.getRawId(id);
    if (!projectRawId) return res.status(404).end();

    const query = { where: { id: projectRawId, CompanyId: req.user.companyId } };
    // TODO: update the deleted flag instead. would require modifications to how we look for a project
    const success = await db.Project.destroy(query);
    res.status(success ? 204 : 404).end();
  }));
};
