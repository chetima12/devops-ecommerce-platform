const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

afterAll(async () => {
  await pool.end();
});

describe('Health Check API', () => {

  test('GET /api/health should return service status', async () => {

    const response = await request(app)
      .get('/api/health');

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe('UP');

  });

});

describe('Products API', () => {

  test('GET /api/products/count should return product count', async () => {

    const response = await request(app)
      .get('/api/products/count');

    expect(response.statusCode).toBe(200);

    expect(response.body.count).toBe(3);

  });

});
