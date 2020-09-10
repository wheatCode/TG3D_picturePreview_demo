const asyncHandler = require('express-async-handler');
const { ForeignKeyConstraintError } = require('sequelize/lib/errors');
const Op = require('sequelize/lib/operators');
const S3 = require('aws-sdk/clients/s3');
const { getYmd } = require('../utils');
const projectMiddleware = require('../middlewares/project');
const imageMiddleware = require('../middlewares/image');
const s3 = new S3({
  accessKeyId: process.env['AWS_KEY_ID'] || process.env['AWS_ACCESS_KEY_ID'],
  secretAccessKey: process.env['AWS_KEY_SECRET'] || process.env['AWS_SECRET_ACCESS_KEY'],
  useAccelerateEndpoint: true,
});

const __PROD__ = process.env['NODE_ENV'] === 'production';

const LABEL_TIMEOUT = process.env['LABEL_TIMEOUT'] || 10 * 60;
const S3_BUCKET = process.env['AWS_S3_BUCKET_NAME'];

const getSignedUrl = (key, operation = 'getObject') => !key ? '' : new Promise((resolve) => {
  if (!__PROD__) return resolve(key);

  s3.getSignedUrl(operation, { Bucket: S3_BUCKET, Key: key }, function (err, url) {
    if (err) {
      console.log('Error getting presigned url from AWS S3', key);
    }
    resolve(url || key);
  });
});

module.exports = (app, db) => {
  const checkProject = projectMiddleware(db);
  const checkImage = imageMiddleware(db);

  // get list of images
  app.get('/api/v1/projects/:id/images', checkProject(), asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0, labeled } = req.query;

    const options = { where: { ProjectId: req.projectRawId, deleted: false } };
    if (labeled === 'true') {
      options.where.status = 2;
    } else if (labeled === 'false') {
      options.where.status = 1;
    }
    let filter = req.query.filter || '';
    filter = filter.trim();
    if (filter.length > 0) {
      options.where['fileName'] = { [Op.like]: `%${filter}%` };
    }
    options.limit = Math.max(Math.min(parseInt(limit, 10), 100), 0);
    options.offset = Math.max(parseInt(offset, 10), 0);

    const { count, rows } = await db.Image.findAndCountAll(options);
    const signedUrls = await Promise.all(rows.map(r => getSignedUrl(r.filePath)));
    res.json({
      total: count,
      offset: options.offset,
      limit: options.limit,
      images: rows.map((r, index) => ({
        ...r.json,
        filePath: signedUrls[index],
      })),
    });
  }));

  // start upload an image
  app.post(
    '/api/v1/projects/:id/start_upload',
    checkProject(),
    asyncHandler(async (req, res) => {
      // 1. validate body
      const { fileName } = req.body;
      if (!fileName) return res.status(400).end();

      // 2. create record
      const record = await db.Image.create({
        fileName,
        filePath: '',
        ProjectId: req.projectRawId,
        status: 0,
        md5: '',
        deleted: false,
        dispatchedAt: null,
      });
      // 3. get s3 url to for the client to upload
      const imageId = record.id;
      const filePath = `${imageId}_${fileName}`;
      const key = `${req.user.companyId}/${req.projectRawId}/${filePath}`;
      const url = await getSignedUrl(key, 'putObject');
      res.json({
        url,
        filePath: imageId,
      });
    })
  );

  // finished uploading an image
  app.post(
    '/api/v1/projects/:id/finish_upload',
    checkProject(),
    asyncHandler(async (req, res) => {
      const { filePath: imageId, md5 } = req.body;
      if (
        !imageId || typeof imageId !== 'string' ||
        !md5 || typeof md5 !== 'string'
      ) return res.status(400).end();

      const imageRawId = db.Image.getRawId(imageId);
      if (!imageRawId) return res.status(404).end();

      const options = { where: { id: imageRawId, ProjectId: req.projectRawId, deleted: false } };
      const record = await db.Image.findOne(options);
      if (!record) return res.status(404).end();

      const key = `${req.user.companyId}/${req.projectRawId}/${imageId}_${record.fileName}`;
      try {
        const { ETag } = await s3.headObject({ Key: key, Bucket: S3_BUCKET }).promise();
        if (md5 !== ETag.replace(/"/g, '')) return res.status(400).end();

        await db.Image.update({
          filePath: key,
          status: 1,
          md5,
        }, options);
        res.json({ id: imageId });
      } catch (e) {
        res.status(e.statusCode || 500).end();
      }
    })
  );

  // get an image
  app.get(
    '/api/v1/projects/:pid/images/:id',
    checkProject('pid'),
    checkImage(),
    asyncHandler(async (req, res) => {
      const signedUrl = await getSignedUrl(req.image.filePath);
      res.json({
        ...req.image.json,
        filePath: signedUrl,
      });
    })
  );

  // delete an image
  app.delete(
    '/api/v1/projects/:pid/images/:id',
    checkProject('pid'),
    checkImage(),
    asyncHandler(async (req, res) => {
      const options = { where: { id: req.imageRawId, ProjectId: req.projectRawId, deleted: false } };

      const [ success ] = await db.Image.update({ deleted: true }, options);
      if (!success) return res.status(404).end();

      res.status(204).end();
    })
  );

  // get list of image's labels
  app.get(
    '/api/v1/projects/:pid/images/:id/labels',
    checkProject('pid'),
    checkImage(),
    asyncHandler(async (req, res) => {
      const labelQueryOptions = {
        where: { ImageId: req.imageRawId },
        include: [{ model: db.Class, attributes: { exclude: ['ProjectId'] } }],
        attributes: { exclude: ['classId'] }
      };
      const labels = await db.Label.findAll(labelQueryOptions);
      res.json({
        labels: labels.map(l => {
          const { bbox, Class } = l.dataValues;
          return {
            id: l.id,
            bbox,
            class: { id: Class.id, name: Class.name },
          };
        })
      });
    })
  );

  // label an image
  app.post('/api/v1/projects/:pid/labels', checkProject('pid'), asyncHandler(async (req, res) => {
    const { labels, imageId } = req.body;
    const imageRawId = db.Image.getRawId(imageId);
    if (imageId && !imageRawId) return res.status(404).end();

    if (labels && !Array.isArray(labels)) return res.status(400).end();

    try {
      const { userId } = req.user;
      // create labels if there's any
      if (Array.isArray(labels) && imageRawId) {
        const data = labels.map(label => {
          const { classId, bbox } = label || {};
          const classRawId = db.Class.getRawId(classId);
          if (!classId || !classRawId) return null;

          const labelPayload =  { ImageId: imageRawId, ClassId: classRawId, UserId: userId };
          if (typeof bbox === 'string' && bbox) return { ...labelPayload, bbox };

          return labelPayload;
        }).filter(l => l);
        if (labels.length > 0 && data.length === 0) return res.status(400).end();

        await db.Label.destroy({ where: { ImageId: imageRawId } });
        const imageQuery = { where: { id: imageRawId, deleted: false } };
        if (data.length > 0) {
          const result = await db.Label.bulkCreate(data);
          if (result) {
            await db.Image.update({ status: 2 }, imageQuery);
          }
        } else {
          await db.Image.update({ status: 1 }, imageQuery);
        }
      }
      // find the next one to be labeled
      const next = await findNextToLabel(req.projectRawId);
      res.json({
        next: next || null,
      });
    } catch (e) {
      console.log(e.message);
      if (e instanceof ForeignKeyConstraintError) res.status(404).end();
      else res.status(500).end();
    }
  }));

  const findNextToLabel = async (projectRawId) => {
    const image = await db.Image.findOne({
      where: {
        ProjectId: projectRawId,
        status: 1,
        deleted: false,
        dispatchedAt: {
          // find image that has not yet been dispatched or was dispatched LABEL_TIMEOUT seconds ago
          [Op.or]: {
            [Op.lt]: new Date(new Date() - (parseInt(LABEL_TIMEOUT, 10) * 1000)),
            [Op.eq]: null
          },
        },
      },
    });
    if (!image) return null;

    const queryOptions = {
      where: {
        id: image.getDataValue('id'),
        status: 1,
        dispatchedAt: image.dispatchedAt,
        deleted: false,
      },
    };
    const [ success ] = await db.Image.update({ dispatchedAt: new Date() }, queryOptions);
    if (success) {
      const signedUrl = await getSignedUrl(image.filePath);
      return {
        ...image.json,
        filePath: signedUrl,
      };
    }

    return await findNextToLabel(projectRawId);
  };
};
