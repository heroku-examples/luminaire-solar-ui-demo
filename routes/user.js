export default async function (fastify, _opts) {
  fastify.addSchema({
    $id: 'error',
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      error: { type: 'string' },
      message: { type: 'string' },
    },
  });

  fastify.addSchema({
    $id: 'user',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      last_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      username: { type: 'string' },
      password: { type: 'string', format: 'password' },
    },
    required: ['name', 'last_name', 'email', 'username'],
  });

  fastify.route({
    method: 'POST',
    url: '/user/authenticate',
    schema: {
      description: 'Authenticate an user',
      tags: ['users'],
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      },
      response: {
        401: {
          description: 'Unauthorized',
          $ref: 'error#',
        },
        200: {
          description: 'User authenticated',
          type: 'object',
          properties: {
            user: { $ref: 'user#' },
            authorization: { type: 'string' },
          },
        },
      },
    },
    handler: async function (request, reply) {
      const { username, password } = request.body;
      const { user, authorization } = await fastify.authenticate({
        username,
        password,
      });
      if (user && authorization) {
        request.session.user = user;
        reply.send({ user, authorization });
      } else {
        reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials',
        });
      }
    },
  });

  fastify.route({
    method: 'GET',
    url: '/user/logout',
    preHandler: fastify.auth([fastify.verifySession]),
    schema: {
      security: [{ cookieAuth: [] }],
      description: 'Logout an user',
      tags: ['users'],
      response: {
        401: {
          description: 'Unauthorized',
          $ref: 'error#',
        },
        500: {
          description: 'Internal Server Error',
          $ref: 'error#',
        },
        200: {
          description: 'Logout response',
          type: 'object',
          properties: {
            authenticated: { type: 'boolean' },
          },
        },
      },
    },
    handler: async function (request, reply) {
      request.session.user = null;
      request.session.destroy((err) => {
        if (err) {
          reply.status(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: err.message,
          });
        }
        reply.send({ authenticated: false });
      });
    },
  });

  fastify.route({
    method: 'GET',
    url: '/user/profile',
    preHandler: fastify.auth([fastify.verifySession]),
    schema: {
      security: [{ cookieAuth: [] }],
      description: 'Get user profile',
      tags: ['users'],
      response: {
        401: {
          description: 'Unauthorized',
          $ref: 'error#',
        },
        200: {
          type: 'object',
          description: 'User profile',
          $ref: 'user#',
        },
      },
    },
    handler: async function (request, reply) {
      reply.send(request.session.user);
    },
  });
}
