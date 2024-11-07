import 'dotenv/config';
import path from 'node:path';
import Fastify from 'fastify';
import FastifyJwt from '@fastify/jwt';
import FastifyVite from '@fastify/vite';
import FastifyAuth from '@fastify/auth';
import FastifyCookie from '@fastify/cookie';
import FastifySession from '@fastify/session';
import FastifyFormBody from '@fastify/formbody';
import AutoLoad from '@fastify/autoload';

const apiUrl = process.env.API_URL || 'http://0.0.0.0:3001';

export async function build(opts = {}) {
  const fastify = Fastify(opts);

  await fastify.register(FastifyFormBody);
  await fastify.register(FastifyVite, {
    root: import.meta.url,
    renderer: '@fastify/react',
    dev: process.argv.includes('--dev'),
  });
  fastify.register(FastifyCookie);
  fastify.register(FastifySession, {
    cookieName: 'sessionId',
    secret: process.env.SESSION_SECRET || 'wesetaluminasolaruisessionsecret',
    maxAge: 60 * 60 * 1000,
    cookie: {
      httpOnly: true,
      secure: 'auto',
    },
  });
  fastify.register(FastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
  });
  fastify
    .decorate('authenticate', async function ({ username, password }) {
      const response = await fetch(apiUrl + '/api/user/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const { authorization } = await response.json();
      const { user } = await fastify.jwt.decode(authorization);
      return { user, authorization };
    })
    .decorate('verifySession', async function (request, _reply) {
      if (!request.session || !request.session.user) {
        throw new Error('User not logged in');
      }
    })
    .register(FastifyAuth)
    .after(() => {
      // This loads all plugins defined in routes
      // define your routes in one of these
      fastify.register(AutoLoad, {
        dir: path.join(import.meta.dirname, 'routes'),
      });
    });

  await fastify.vite.ready();
  await fastify.ready();
  return fastify;
}
