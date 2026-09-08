const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {

  test('GET /api/health should return service status', async () => {

    const response = await request(app)
      .get('/api/health');

    expect(response.statusCode).toBe(200);

    expect(response.body.status).toBe('UP');

  });

});
