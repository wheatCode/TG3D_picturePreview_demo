import test from 'ava';
import supertest from 'supertest';

import { app } from '../index';

const request = supertest(app);

test('login failed: no account', async t => {
  const res = await request.post('/api/v1/login').send({ account: '', password: 'tg3d1234' });
  t.is(res.status, 400);
  t.truthy(res.body.message);
});

test('login failed: incorrect password', async t => {
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'so_WRONG' });
  t.is(res.status, 401);
  t.truthy(res.body.message);
});

test('login success', async t => {
  const res = await request.post('/api/v1/login').send({ account: 'test1@tg3ds.com', password: 'tg3d1234' });
  t.is(res.status, 200);
  t.truthy(res.body.token);
});
