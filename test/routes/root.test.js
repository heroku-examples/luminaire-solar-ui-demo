import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../helper.js';

test('default root route', async (t) => {
  const app = await buildApp(t);

  const res = await app.inject({
    url: '/',
  });
  assert.equal(res.statusCode, 200);
});
