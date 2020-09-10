import { serial as test } from 'ava';
import supertest from 'supertest';

import { app } from '../index';

const request = supertest(app);

let project;
let image;
let classToLabel;
let image2;
let imageTotal;

test.before(async t => {
  // This runs before all tests
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'tg3d1234' });
  t.is(res.status, 200);
  t.truthy(res.body.token);
  t.context.token = `Bearer ${res.body.token}`;
  const resProjects = await request.get('/api/v1/projects').send(project).set('Authorization', t.context.token);
  t.is(resProjects.status, 200);
  project = resProjects.body.projects[0];
  classToLabel = project.classes[0];
  t.truthy(project.id);
  t.truthy(project.total);
  imageTotal = project.total;
});

test('get list of images of project failed: no token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images`);
  t.is(res.status, 401);
});

test('get list of images of project failed: invalid token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('get list of images of project failed: invalid project id', async t => {
  const res = await request.get('/api/v1/projects/fakeId5566/images').set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get list of images of project success', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.images.length > 0);
  t.is(body.total, project.total);
});

test('get list of images of project success: with pagination working', async t => {
  const resAll = await request.get(`/api/v1/projects/${project.id}/images`).set('Authorization', t.context.token);
  t.is(resAll.status, 200);
  t.is(resAll.body.images.length, resAll.body.limit);
  const targetIndex = 5;
  const someImage = resAll.body.images[targetIndex];

  const offset = targetIndex;
  const limit = 6;
  const res = await request.get(`/api/v1/projects/${project.id}/images?offset=${offset}&limit=${limit}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { offset: offsetResp, limit: limitResp, images, total } = body;

  t.is(status, 200);
  t.is(images.length, body.limit);
  t.is(limitResp, limit);
  t.is(offsetResp, offset);
  t.is(total, resAll.body.total);
  t.is(body.images[0].id, someImage.id);
});

test('get list of images of project success: with pagination working within restriction', async t => {
  const offset = -1;
  const limit = 200;
  const res = await request.get(`/api/v1/projects/${project.id}/images?offset=${offset}&limit=${limit}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { offset: offsetResp, limit: limitResp } = body;

  t.is(status, 200);
  t.is(limitResp, 100);
  t.is(offsetResp, 0);
});

test('get list of images of project success: with only labeled', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images?labeled=true&limit=100`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.images.length > 0);
  t.truthy(body.images.every(i => i.status === 2));
});

test('get list of images of project success: with only not-labeled', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images?labeled=false&limit=100`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.images.length > 0);
  t.truthy(body.images.every(i => i.status === 1));
  image = body.images[0];
});

test('get list of images of project success: with filter working', async t => {
  const filter = 'image 3';
  const res = await request.get(`/api/v1/projects/${project.id}/images?filter=${filter}`).set('Authorization', t.context.token);
  const { status, body } = res;
  const { images, total } = body;

  t.is(status, 200);
  t.is(images.length, total);
  t.truthy(total > 1);
  t.truthy(images.every(p => p.fileName.toLowerCase().indexOf(filter) > -1));

  const filter2 = 'image 13';
  const res2 = await request.get(`/api/v1/projects/${project.id}/images?filter=${filter2}`).set('Authorization', t.context.token);
  const images2 = res2.body.images;

  t.is(res2.status, 200);
  t.is(images2.length, res2.body.total);
  t.is(res2.body.total, 1);
  t.truthy(images2.every(p => p.fileName.toLowerCase().indexOf(filter2) > -1));
});

test('get list of image labels failed: no token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`);
  t.is(res.status, 401);
});

test('get list of image labels failed: invalid token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('get list of image labels failed: invalid project id', async t => {
  const res = await request.get(`/api/v1/projects/fakeId5566/images/${image.id}/labels`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get list of image labels failed: invalid image id', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/fakeId789/labels`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get list of image labels success: no labels yet', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.labels.length, 0);
});

test('get an image failed: no token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}`);
  t.is(res.status, 401);
});

test('get an image failed: invalid token', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('get an image failed: invalid project id', async t => {
  const res = await request.get(`/api/v1/projects/fakeId5566/images/${image.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get an image failed: invalid image id', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/fakeId789`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('get an image success', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.id);
  t.truthy(body.fileName);
  t.truthy(body.filePath);
  t.truthy(body.status);
  t.truthy(typeof body.dispatchedAt !== 'undefined');
  t.truthy(typeof body.deleted === 'undefined');
});

test('label an image failed: no token', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/labels`);
  t.is(res.status, 401);
});

test('label an image failed: wrong project id', async t => {
  const res = await request.post('/api/v1/projects/fakeId678/labels').set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('label an image failed: wrong image id', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send({ imageId: 'fakeId999' }).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('label an image failed: invalid labels', async t => {
  const payload = {
    imageId: image.id,
    labels: 123,
  };
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  t.is(res.status, 400);
});

test('label an image failed: invalid payload in labels', async t => {
  const payload = {
    imageId: image.id,
    labels: [{ classId: [] }],
  };
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  t.is(res.status, 400);
});

test('label an image success: get next without posting data', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.next);
  t.is(body.next.id, image.id);
  t.is(body.next.status, 1);
});

test('label an image success: invalid imageId still gets next', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send({ imageId: '', labels: [] }).set('Authorization', t.context.token);
  t.is(res.status, 200);
  t.truthy(res.body.next);
});

test('label an image success: get next without posting data again', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.next);
  t.falsy(body.next.id === image.id);
  t.is(body.next.status, 1);
  image = body.next;
});

test('label an image success: nothing left to labeled', async t => {
  const res = await request.get('/api/v1/projects?sort=name').set('Authorization', t.context.token);
  t.is(res.status, 200);
  const projectWith1Image = res.body.projects[0];
  t.is(projectWith1Image.name, 'ProjectWithOnly1Images');
  t.is(projectWith1Image.total, 1);

  const resPost = await request.post(`/api/v1/projects/${projectWith1Image.id}/labels`).set('Authorization', t.context.token);
  t.is(resPost.status, 200);
  t.truthy(resPost.body.next);
  const resPost2 = await request.post(`/api/v1/projects/${projectWith1Image.id}/labels`).set('Authorization', t.context.token);
  t.is(resPost2.status, 200);
  t.falsy(resPost2.body.next);
});

test('label an image success', async t => {
  const payload = {
    imageId: image.id,
    labels: [{ classId: classToLabel.id }],
  };
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.truthy(body.next);
  t.falsy(body.next.id === image.id);
  t.is(body.next.status, 1);

  image2 = body.next;
});

test('update one project failed: labelingType cannot be changed after first label is created', async t => {
  const res = await request.post(`/api/v1/projects/${project.id}`).send({ labelingType: project.labelingType + 1 }).set('Authorization', t.context.token);
  const { status } = res;
  t.is(status, 400);
});

test('get list of image labels success', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`).set('Authorization', t.context.token);
  const { status, body } = res;
  t.is(status, 200);
  t.is(body.labels.length, 1);
  t.is(body.labels[0].class.id, classToLabel.id);
  t.is(body.labels[0].class.name, classToLabel.name);
});

test('get list of image labels success: re-label again', async t => {
  const { classes } = project;
  const newLabels = [{ classId: classes[1].id }, { classId: classes[2].id }];
  const payload = {
    imageId: image.id,
    labels: newLabels,
  };
  const resPost = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  t.is(resPost.status, 200);
  t.truthy(resPost.body.next);
  const resGet = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`).set('Authorization', t.context.token);
  const { status, body } = resGet;
  t.is(status, 200);
  t.is(body.labels.length, newLabels.length);
  t.truthy(body.labels.every((l, index) => l.class.id === newLabels[index].classId));
});

test('label an image success: post empty labels to reset image label status', async t => {
  const payload = {
    imageId: image.id,
    labels: [],
  };
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  t.is(res.status, 200);
  const resGet = await request.get(`/api/v1/projects/${project.id}/images/${image.id}/labels`).set('Authorization', t.context.token);
  t.is(resGet.status, 200);
  t.is(resGet.body.labels.length, 0);
  const { status, body } = await request.get(`/api/v1/projects/${project.id}/images?filter=${image.fileName}`).set('Authorization', t.context.token);
  t.is(status, 200);
  t.truthy(body.images.length > 0);
  t.truthy(body.images.find(i => i.fileName === image.fileName && i.status === 1));
});

test('delete a class should also delete associated labels', async t => {
  const payload = {
    imageId: image2.id,
    labels: [{ classId: classToLabel.id }],
  };
  const res = await request.post(`/api/v1/projects/${project.id}/labels`).send(payload).set('Authorization', t.context.token);
  t.is(res.status, 200);

  const resGetLabels = await request.get(`/api/v1/projects/${project.id}/images/${image2.id}/labels`).set('Authorization', t.context.token);
  t.is(resGetLabels.status, 200);
  t.is(resGetLabels.body.labels.length, 1);

  const resGetImages = await request.get(`/api/v1/projects/${project.id}/images`).set('Authorization', t.context.token);
  const { status, body } = resGetImages;
  t.is(status, 200);
  const target = body.images.find(i => i.id === image2.id);
  t.truthy(target);
  t.is(target.status, 2);

  const resDel = await request.delete(`/api/v1/projects/${project.id}/classes/${classToLabel.id}`).set('Authorization', t.context.token);
  t.is(resDel.status, 204);

  const resDelAgain = await request.delete(`/api/v1/projects/${project.id}/classes/${classToLabel.id}`).set('Authorization', t.context.token);
  t.is(resDelAgain.status, 404);

  const resGetImagesAgain = await request.get(`/api/v1/projects/${project.id}/images`).set('Authorization', t.context.token);
  const { status: status2, body: body2 } = resGetImagesAgain;
  t.is(status2, 200);
  const target2 = body2.images.find(i => i.id === image2.id);
  t.truthy(target2);
  t.is(target2.status, 1);

  const resGetLabels2 = await request.get(`/api/v1/projects/${project.id}/images/${image2.id}/labels`).set('Authorization', t.context.token);
  t.is(resGetLabels2.status, 200);
  t.is(resGetLabels2.body.labels.length, 0);
});

test('delete an image failed: no token', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/images/${image.id}`);
  t.is(res.status, 401);
});

test('delete an image failed: invalid token', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', 'Bearer asdasdasdasd');
  t.is(res.status, 401);
});

test('delete an image failed: invalid project id', async t => {
  const res = await request.delete(`/api/v1/projects/fakeId5566/images/${image.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('delete an image failed: invalid image id', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/images/fakeId789`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});

test('delete an image success', async t => {
  const res = await request.delete(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', t.context.token);
  t.is(res.status, 204);
  const resDelAgain = await request.delete(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', t.context.token);
  t.is(resDelAgain.status, 404);
  const resProject = await request.get(`/api/v1/projects/${project.id}`).set('Authorization', t.context.token);
  t.is(resProject.status, 200);
  t.is(resProject.body.total, imageTotal - 1);
});

test('get an image failed: deleted', async t => {
  const res = await request.get(`/api/v1/projects/${project.id}/images/${image.id}`).set('Authorization', t.context.token);
  t.is(res.status, 404);
});
