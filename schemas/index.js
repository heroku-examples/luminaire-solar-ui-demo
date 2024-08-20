export const systemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    address: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    zip: { type: 'string' },
    country: { type: 'string' },
  },
  required: ['address', 'city', 'state', 'zip', 'country'],
};

export const metricSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    system_id: { type: 'string', format: 'uuid' },
    energy_produced: { type: 'number' },
    energy_consumed: { type: 'number' },
    datetime: { type: 'string', format: 'date-time' },
  },
  required: ['system_id', 'energy_produced', 'energy_consumed'],
};

export const summarySchema = {
  type: 'object',
  properties: {
    date: { type: 'string', format: 'date' },
    total_energy_produced: { type: 'number' },
    total_energy_consumed: { type: 'number' },
  },
  required: ['date', 'total_energy_produced', 'total_energy_consumed'],
};

export const allSummarySchema = {
  type: 'object',
  properties: {
    daily: { type: 'array', items: { $ref: 'summary#' } },
    weekly: { type: 'array', items: { $ref: 'summary#' } },
    monthly: { type: 'array', items: { $ref: 'summary#' } },
  },
  required: ['daily', 'weekly', 'monthly'],
};

export const userSchema = {
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
};

export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    price: { type: 'number' },
  },
  required: ['name', 'description', 'imageUrl', 'price'],
};

export const errorSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['statusCode', 'error', 'message'],
};
