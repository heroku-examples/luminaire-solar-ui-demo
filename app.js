import 'dotenv/config';
import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';
import FastifyFormBody from '@fastify/formbody';

export async function build(opts = {}) {
  const fastify = Fastify(opts);

  await fastify.register(FastifyFormBody);
  await fastify.register(FastifyVite, {
    root: import.meta.url,
    renderer: '@fastify/react',
    dev: process.argv.includes('--dev'),
  });

  await fastify.vite.ready();
  await fastify.ready();
  return fastify;
}
