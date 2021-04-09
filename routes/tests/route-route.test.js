const { addTestRoutes, addUser, removeUsedByEmail } = require('./helpers');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

const user = {
  email: 'routetester@mail.ru',
  name: 'routetester',
  password: '123456',
};

beforeAll(async () => {
  // Add test routes for request
  //await addTestRoutes(150);
  await addUser(user);
});
afterAll(async () => {
  await removeUsedByEmail(user.email);
  await mongoose.connection.close();
});
describe('POST /route/ , get routes card all or by params', () => {
  // {name: String, difficult: [] || null, bikeType: [] || null, type: [] || null} || {noParams: true}
  test('Get all route cards(without params)', async () => {
    const res = await request(app)
      .post('/route')
      .send({ name: '', difficult: null, bikeType: null, type: null });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test('Get all route cards(with params {})', async () => {
    const res = await request(app)
      .post('/route')
      .send({ name: null, difficult: null, bikeType: null, type: ['Эндуро'] });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test('Get all route cards(with params {})', async () => {
    const res = await request(app)
      .post('/route')
      .send({
        name: null,
        difficult: null,
        bikeType: ['Простой'],
        type: ['Эндуро'],
      });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
describe('GET /route/:id, get full route data by ID (auth)', () => {
  test('GET route data by RouteId', async () => {
    // Do request for get id from DB
    const resForId = await request(app)
      .post('/route')
      .send({ name: '', difficult: null, bikeType: null, type: null });
    expect(resForId.statusCode).toBe(200);
    const id = resForId.body[0]._id;
    // Do request bu id
    const url = `/route/${id}`;
    const reqById = await request(app).get(url);
    expect(reqById.statusCode).toBe(200);
    expect(typeof reqById.body === 'object').toBeTruthy();
  });
  test('GET route data by RouteId with invalid ID', async () => {
    // Do request by id
    const id = 'invalid_id';
    const url = `/route/${id}`;
    const reqById = await request(app).get(url);
    expect(reqById.statusCode).toBe(400);
    expect(reqById.body).toHaveProperty('error');
  });
  test('GET route data by RouteId without ID', async () => {
    // Do request bu id
    const url = `/route`;
    const reqById = await request(app).get(url);
    console.log('WithoutId', reqById.body);
    expect(reqById.statusCode).toBe(404);
    //expect(reqById.body).toBeNull();
  });
});

describe('DELETE /route/:id, delete route by ID (auth)', () => {
  test('DELETE Route by Id', async () => {
    //Login user for auth and add route draft
    const { email, password } = user;
    const regUser = await request(app)
      .post('/auth/login')
      .send({ email, password });
    expect(regUser.statusCode).toBe(200);
    expect(regUser.body).toHaveProperty('token');
    // Do request for submit new route draft
    const { token } = regUser.body;
    const { _id } = regUser.body.user;
    const accessToken = `Bearer ${token}`;
    const res = await request(app)
      .post('/route/adddraft')
      .set('Authorization', accessToken)
      .send({ name: 'routeFromTester', author: { id: _id, email } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('routeDraft');
    // Try to DELETE saved routeDraft Data
    const draftId = res.body.routeDraft._id;
    const url = `/route/${draftId}`;
    const reqById = await request(app)
      .delete(url)
      .set('Authorization', accessToken);
    expect(reqById.statusCode).toBe(200);
    expect(typeof reqById.body === 'object').toBeTruthy();
  });
});
describe('/route/adddraft, add new route draft (auth)', () => {
  test('add new routedraft', async () => {
    //Login user for auth and add route draft
    const { email, password } = user;
    const regUser = await request(app)
      .post('/auth/login')
      .send({ email, password });
    expect(regUser.statusCode).toBe(200);
    expect(regUser.body).toHaveProperty('token');
    // Do request for submit new route draft
    const { token } = regUser.body;
    const { _id } = regUser.body.user;
    const accessToken = `Bearer ${token}`;
    const res = await request(app)
      .post('/route/adddraft')
      .set('Authorization', accessToken)
      .send({ name: 'routeFromTester', author: { id: _id, email } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('routeDraft');
    // Try get saved routeDraft Data
    const draftId = res.body.routeDraft._id;
    const url = `/route/${draftId}`;
    const reqById = await request(app).get(url);
    expect(reqById.statusCode).toBe(200);
    expect(typeof reqById.body === 'object').toBeTruthy();
  });
  // test.todo(
  //   'add route draft without required fields(name, author field is required)',
  //   async () => {}
  // );
});

// describe('PUT /add/:id, change route data, pulication route', () => {});
