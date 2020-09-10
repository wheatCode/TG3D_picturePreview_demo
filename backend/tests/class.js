import { serial as test } from 'ava';
import supertest from 'supertest';

import { app } from '../index';

const request = supertest(app);

const project = {
  name: 'Test Project',
  labelingType: 0,
  classes: ['Class1', 'Class2', 'Class3'],
};
const newClass = { name: 'NewClass' };

test.before(async t => {
  // This runs before all tests
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'tg3d1234' });
  t.is(res.status, 200);
  t.truthy(res.body.token);
  t.context.token = `Bearer ${res.body.token}`;
  const resProject = await request.post('/api/v1/projects').send(project).set('Authorization', t.context.token);
  t.is(resProject.status, 200);
  t.truthy(resProject.body.id);
  project.id = resProject.body.id;
});

test('get list of classes of project failed: no token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}`);
  t.is(res.status, 401);
});

test('get list of classes of project failed: invalid token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/classes`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('get list of classes of project failed: invalid id', async t => {
  const res = await request.get('/api/v1/projects/fakeId5566/classes').set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get list of classes of project success', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/classes`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.classes.length > 0);
  t.is(body.classes.length, project.classes.length);
});

test('create one class for a project failed: no token', async t => {
  const resFailed = await request.post(`/api/v1/projects/${project.id}/classes`);
  t.is(resFailed.status, 401);
});

test('create one class for a project failed: wrong id', async t => {
  const resFailed = await request.post('/api/v1/projects/fakeId5566/classes').set('Authorization', t.context.token);
  t.is(resFailed.status, 404);
});

test('create one class for a project failed: invalid name', async t => {
  const resFailed = await request.post(`/api/v1/projects/${project.id}/classes`).send({ name: '' }).set('Authorization', t.context.token);
  t.is(resFailed.status, 400);
});

test('create one class for a project success', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/classes`).send({ name: newClass.name }).set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.truthy(res.body.id);
  newClass.id = res.body.id;
  const res2 = await request.get(`/api/v1/projects/${project.id}/classes`).set('Authorization', t.context.token);
  const { status, body } = res2;
  t.is(status, 200);
  t.truthy(body.classes.length > 0);
  t.is(body.classes.length, project.classes.length + 1);
  t.truthy(body.classes.find(c => c.id === newClass.id && c.name === newClass.name));
});

test('update one class failed: no token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/classes/${newClass.id}`);
  const { status } = res;
  t.is(status, 401);
});

test('update one class failed: wrong project id', async t => {
  const res = await request.post(`/api/v1/projects/fakeId999/classes/${newClass.id}`).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 404);
});

test('update one class failed: wrong class id', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/classes/fakeId999`).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 404);
});

test('update one class failed: empty payload', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/classes/${newClass.id}`).send({}).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('update one class failed: invalid name', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/classes/${newClass.id}`).send({ name: '' }).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('update one class success', async t => {
  const newName = 'UpdatedName';
  const res = await request.post(`/api/v1/projects/${project.id}/classes/${newClass.id}`).send({ name: newName }).set('Authorization', t.context.token);
  t.is(res.status, 200);
  const res2 = await request.get(`/api/v1/projects/${project.id}/classes`).set('Authorization', t.context.token);
  const { status, body } = res2;
  t.is(status, 200);
  const updatedClass = body.classes.find(c => c.id === newClass.id);
  t.truthy(updatedClass);
  t.is(updatedClass.name, newName);
});

test('delete one class failed: no token', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/classes/${newClass.id}`);
  t.is(res.status, 401);
});

test('delete one class failed: wrong project id', async t => {
  const res = await request.delete(`/api/v1/projects/fakeId999/classes/${newClass.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('delete one class failed: wrong class id', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/classes/fakeId789`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('delete one class success', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/classes/${newClass.id}`).set('Authorization', t.context.token);
  t.is(res.status, 204);
});

test('delete one class failed: item deleted already', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/classes/${newClass.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('update one class failed: item does not exist', async t => {
  const newName = 'UpdatedName';
  const res = await request.post(`/api/v1/projects/${project.id}/classes/${newClass.id}`).send({ name: newName }).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get list of classes success: item removed', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/classes`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.classes.length, project.classes.length);
  t.falsy(body.classes.find(c => c.id === newClass.id));
});
