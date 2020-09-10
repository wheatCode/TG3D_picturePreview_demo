import { serial as test } from 'ava';
import supertest from 'supertest';

import { app } from '../index';

const request = supertest(app);

let project;
const fileName = 'test.jpg';
const correctMd5 = '123123123';
let filePath;

test.before(async t => {
  // This runs before all tests
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'tg3d1234' });
  t.is(res.status, 200);
  t.truthy(res.body.token);
  t.context.token = `Bearer ${res.body.token}`;
  const resProjects = await request.get('/api/v1/projects').send(project).set('Authorization', t.context.token);
  t.is(resProjects.status, 200);
  project = resProjects.body.projects[0];
  t.truthy(project.id);
  t.truthy(project.total);
});

test('request to upload an image failed: no token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/start_upload`);
  t.is(res.status, 401);
});

test('request to upload an image failed: invalid token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/start_upload`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('request to upload an image failed: invalid project id', async t => {
  const res = await request.post('/api/v1/projects/fakeId5566/start_upload').set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('request to upload an image failed: invalid payload', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/start_upload`).send({}).set('Authorization', t.context.token);
  t.is(res.status, 400);
  const res2 = await request.post(`/api/v1/projects/${project.id}/start_upload`).send({ fileName: '' }).set('Authorization', t.context.token);
  t.is(res2.status, 400)
});

test('request to upload an image success', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/start_upload`).send({ fileName }).set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.truthy(res.body.url);
  t.truthy(res.body.filePath);
  filePath = res.body.filePath;
});

test('a new image record is created after start-upload request is made', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${filePath}`).set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.is(res.body.status, 0);
  t.is(res.body.fileName, fileName);
  t.falsy(res.body.md5);
  t.falsy(res.body.filePath);
});

test('finish uploading an image failed: no token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/finish_upload`);
  t.is(res.status, 401);
});

test('finish uploading an image failed: invalid token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/finish_upload`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('finish uploading an image failed: invalid project id', async t => {
  const res = await request.post('/api/v1/projects/fakeId5566/finish_upload').set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('finish uploading an image failed: invalid payload', async t => {
  const path = `/api/v1/projects/${project.id}/finish_upload`;
  const res = await request.post(path).send({}).set('Authorization', t.context.token);
  t.is(res.status, 400);
  const res2 = await request.post(path).send({ filePath: 'qwe' }).set('Authorization', t.context.token);
  t.is(res2.status, 400);
  const res3 = await request.post(path).send({ md5: '123' }).set('Authorization', t.context.token);
  t.is(res3.status, 400);
  const res4 = await request.post(path).send({ filePath: '', md5: '123' }).set('Authorization', t.context.token);
  t.is(res4.status, 400);
  const res5 = await request.post(path).send({ filePath: '123', md5: '' }).set('Authorization', t.context.token);
  t.is(res5.status, 400);
  const res6 = await request.post(path).send({ filePath: 123, md5: 321 }).set('Authorization', t.context.token);
  t.is(res6.status, 400);
});

test('finish uploading an image failed: file does not exist', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/finish_upload`)
    .send({ filePath: 'fake', md5: correctMd5 })
    .set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('finish uploading an image failed: md5 not matched', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/finish_upload`)
    .send({ filePath, md5: 'wrong_md5' })
    .set('Authorization', t.context.token);
  t.is(res.status, 400);
});

test('finish uploading an image success', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/finish_upload`)
    .send({ filePath, md5: correctMd5 })
    .set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.truthy(res.body.id);
});

test('new image record status is updated after finish-upload request is made', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${filePath}`).set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.is(res.body.status, 1);
  t.is(res.body.fileName, fileName);
  t.is(res.body.md5, correctMd5);
  t.truthy(res.body.filePath);
});
