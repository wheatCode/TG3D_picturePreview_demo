import { serial as test } from 'ava';
import supertest from 'supertest';

import { app } from '../index';

const request = supertest(app);

let projectWithoutClasses;
let projectWithClasses;
let totalProjectCount;

test.before(async t => {
  // This runs before all tests
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'tg3d1234' });
  t.is(res.status, 200);
  t.truthy(res.body.token);
  t.context.token = `Bearer ${res.body.token}`;
});

test('get project list failed: no token', async t => {
  const res = await request.get('/api/v1/projects');
  t.is(res.status, 401);
});

test('get project list failed: invalid token', async t => {
  const res = await request.get('/api/v1/projects').set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('get project list success', async t => {
  const res = await request.get('/api/v1/projects').set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.projects.length, body.limit);
  totalProjectCount = body.total;
});

test('get project list success with pagination working', async t => {
  const res1 = await request.get('/api/v1/projects').set('Authorization', t.context.token);
  t.is(res1.status, 200);
  t.is(res1.body.projects.length, res1.body.limit);
  const targetIndex = 5;
  const someProject = res1.body.projects[targetIndex];

  const offset = targetIndex;
  const limit = 6;
  const res = await request.get(`/api/v1/projects?offset=${offset}&limit=${limit}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { offset: offsetResp, limit: limitResp, projects, total } = body;

  t.is(status, 200);
  t.is(projects.length, body.limit);
  t.is(limitResp, limit);
  t.is(offsetResp, offset);
  t.is(total, res1.body.total);
  t.is(body.projects[0].id, someProject.id);
});

test('get project list success: with pagination working within restriction', async t => {
  const offset = -1;
  const limit = 200;
  const res = await request.get(`/api/v1/projects?offset=${offset}&limit=${limit}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { offset: offsetResp, limit: limitResp } = body;

  t.is(status, 200);
  t.is(limitResp, 100);
  t.is(offsetResp, 0);
});

test('get project list success: with images', async t => {
  const offset = 0;
  const limit = 1;
  const res = await request.get(`/api/v1/projects?offset=${offset}&limit=${limit}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { offset: offsetResp, limit: limitResp, projects, total } = body;

  t.is(status, 200);
  t.is(projects.length, body.limit);
  t.is(limitResp, limit);
  t.is(offsetResp, offset);
  t.truthy(body.projects[0].labeled);
  t.truthy(body.projects[0].total);
  t.truthy(body.projects[0].classes.length);
});

test('get project list success: with filter working', async t => {
  const filter = 'type 3';
  const res = await request.get(`/api/v1/projects?filter=${filter}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { projects, total } = body;

  t.is(status, 200);
  t.is(projects.length, total);
  t.truthy(total > 1);
  t.truthy(projects.every(p => p.name.toLowerCase().indexOf(filter) > -1));

  const filter2 = 'type 13';
  const res2 = await request.get(`/api/v1/projects?filter=${filter2}`).set('Authorization', t.context.token);
  const projects2 = res2.body.projects;

  t.is(res2.status, 200);
  t.is(projects2.length, res2.body.total);
  t.is(res2.body.total, 1);
  t.truthy(projects2.every(p => p.name.toLowerCase().indexOf(filter2) > -1));
});

test('create one project failed: no token', async t => {
  const resFailed = await request.post('/api/v1/projects');
  t.is(resFailed.status, 401);
});

test('create one project failed: invalid name', async t => {
  const resFailed = await request.post('/api/v1/projects').send({ name: '', labelingType: 0, classes: ['test'] }).set('Authorization', t.context.token);
  t.is(resFailed.status, 400);
});

test('create one project failed: invalid labelingType', async t => {
  const resFailed = await request.post('/api/v1/projects').send({ name: 'Test', labelingType: -1, classes: ['test'] }).set('Authorization', t.context.token);
  t.is(resFailed.status, 400);
  const resFailed2 = await request.post('/api/v1/projects').send({ name: 'Test', classes: ['test'] }).set('Authorization', t.context.token);
  t.is(resFailed2.status, 400);
  const resFailed3 = await request.post('/api/v1/projects').send({ name: 'Test', labelingType: 3, classes: ['test'] }).set('Authorization', t.context.token);
  t.is(resFailed3.status, 400);
  const resFailed4 = await request.post('/api/v1/projects').send({ name: 'Test', labelingType: '2', classes: ['test'] }).set('Authorization', t.context.token);
  t.is(resFailed4.status, 400);
});

test('create one project failed: empty classes', async t => {
  const resFailed = await request.post('/api/v1/projects').send({ name: 'Test', labelingType: 1, classes: [] }).set('Authorization', t.context.token);
  t.is(resFailed.status, 400);
});

test('create one project success: without classes', async t => {
  const name = 'Test 5566';
  const labelingType = 1;
  const payload = {
    name,
    labelingType,
  };
  const resSuccess = await request.post('/api/v1/projects').send(payload).set('Authorization', t.context.token);
  t.is(resSuccess.status, 200);
  t.truthy(resSuccess.body.id);
  projectWithoutClasses = {
    ...payload,
    id: resSuccess.body.id,
  };
});

test('create one project success: with classes', async t => {
  const payload = {
    name: 'Test 5566',
    labelingType: 1,
    classes: ['123', '456', '789'],
  };
  const resSuccess = await request.post('/api/v1/projects').send(payload).set('Authorization', t.context.token);
  t.is(resSuccess.status, 200);
  t.truthy(resSuccess.body.id);
  projectWithClasses = {
    ...payload,
    id: resSuccess.body.id,
  };
});

test('get one project failed: no token', async t => {
  const project = projectWithoutClasses;
  const res = await request.get(`/api/v1/projects/${projectWithoutClasses.id}`);
  t.is(res.status, 401);
});

test('get one project failed: wrong id', async t => {
  const res = await request.get(`/api/v1/projects/FakeID5566`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get one project success: no classes', async t => {
  const project = projectWithoutClasses;
  console.log('project', project);
  const res = await request.get(`/api/v1/projects/${project.id}`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.name, project.name);
  t.is(body.labelingType, project.labelingType);
  t.is(body.labeled, 0);
  t.is(body.total, 0);
  t.is(body.classes.length, 0);
});

test('get one project success: with classes', async t => {
  const project = projectWithClasses;
  const res = await request.get(`/api/v1/projects/${project.id}`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.name, project.name);
  t.is(body.labelingType, project.labelingType);
  t.is(body.labeled, 0);
  t.is(body.total, 0);
  t.is(body.classes.length, project.classes.length);
  t.truthy(project.classes.every((c, index) => c === body.classes[index].name));
});

test('update one project failed: no token', async t => {
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`);
  const { status } = res;
  t.is(status, 401);
});

test('update one project failed: wrong id', async t => {
  const res = await request.post('/api/v1/projects/fAKEiD5566').set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 404);
});

test('update one project failed: empty payload', async t => {
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`).send({}).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('update one project failed: invalid name', async t => {
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`).send({ name: '' }).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('update one project failed: invalid labelingType', async t => {
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`).send({ labelingType: '-1' }).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('update one project success', async t => {
  const newLabelingType = 0;
  const newName = 'Updated Name';
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`).send({ name: newName, labelingType: newLabelingType }).set('Authorization', t.context.token);
  t.is(res.status, 200);
  const res2 = await request.get(`/api/v1/projects/${projectWithClasses.id}`).set('Authorization', t.context.token);
  const { status, body } = res2;
  t.is(status, 200);
  t.is(body.labelingType, newLabelingType);
  t.is(body.name, newName);
  t.truthy(projectWithClasses.labelingType !== newLabelingType);
  t.truthy(projectWithClasses.name !== newLabelingType);
});

test('delete one project failed: no token', async t => {
  const res = await request.delete(`/api/v1/projects/${projectWithClasses.id}`);
  t.is(res.status, 401);
});

test('delete one project failed: wrong id', async t => {
  const res = await request.delete(`/api/v1/projects/fakeId999`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('delete one project success', async t => {
  const res = await request.delete(`/api/v1/projects/${projectWithClasses.id}`).set('Authorization', t.context.token);
  t.is(res.status, 204);
});

test('delete one project failed: item deleted already', async t => {
  const res = await request.delete(`/api/v1/projects/${projectWithClasses.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get one project failed: item does not exist', async t => {
  const res = await request.get(`/api/v1/projects/${projectWithClasses.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('update one project failed: item does not exist', async t => {
  const newLabelingType = 0;
  const newName = 'Updated Name';
  const res = await request.post(`/api/v1/projects/${projectWithClasses.id}`).send({ name: newName, labelingType: newLabelingType }).set('Authorization', t.context.token);
  t.is(res.status, 404);
});
