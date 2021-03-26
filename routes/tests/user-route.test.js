const request = require('supertest');
const app = require('../../app');
const { generateJWTToken, cookieParser } = require('./helpers');
const USER_ID = '5fbd61ca0ff44e41000975e6'; // user andrey_pushkin@mail.ru
const mongoose = require('mongoose');
const path = require('path');
const Mail = require('nodemailer/lib/mailer');

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Test get User Routes', () => {
  test('Get user routes with valid token', async () => {
    const jwt = generateJWTToken(USER_ID, '50000ms');
    const accessToken = `Bearer ${jwt}`;
    const res = await request(app)
      .get('/user/myroutes')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test('Get user routes with expired token', async () => {
    const jwt = generateJWTToken(USER_ID, '1ms');
    const accessToken = `Bearer ${jwt}`;

    const res = await request(app)
      .get('/user/myroutes')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Get user routes with valid token but not valid Id', async () => {
    const jwt = generateJWTToken('invaid id', '50000ms');
    const accessToken = `Bearer ${jwt}`;

    const res = await request(app)
      .get('/user/myroutes')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Get user routes without token in headers', async () => {
    const res = await request(app).get('/user/myroutes');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
  test('Get user routes with invalid header format(without Bearer)', async () => {
    const jwt = generateJWTToken(USER_ID, '50000ms');
    const accessToken = `${jwt}`;

    const res = await request(app)
      .get('/user/myroutes')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(200);
  });
});

describe('Test Get User RouteDrafts', () => {
  test('Get user RouteDrafts with valid token', async () => {
    const jwt = generateJWTToken(USER_ID, '50000ms');
    const accessToken = `Bearer ${jwt}`;
    const res = await request(app)
      .get('/user/myroutedrafts')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  test('Get user RouteDrafts with expired token', async () => {
    const jwt = generateJWTToken(USER_ID, '1ms');
    const accessToken = `Bearer ${jwt}`;

    const res = await request(app)
      .get('/user/myroutedrafts')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Get user RouteDrafts with valid token but not valid Id', async () => {
    const jwt = generateJWTToken('invaid id', '50000ms');
    const accessToken = `Bearer ${jwt}`;

    const res = await request(app)
      .get('/user/myroutedrafts')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
  test('Get user RouteDrafts with invalid token format', async () => {
    const jwt = 'INVALID_dfsdfsdfsdfsdfdsff';
    const accessToken = `Bearer ${jwt}`;

    const res = await request(app)
      .get('/user/myroutedrafts')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Get user RouteDrafts without token in headers', async () => {
    const res = await request(app).get('/user/myroutedrafts');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
  test('Get user RouteDrafts with invalid header format(without Bearer)', async () => {
    const jwt = generateJWTToken(USER_ID, '50000ms');
    const accessToken = `${jwt}`;

    const res = await request(app)
      .get('/user/myroutedrafts')
      .set('Authorization', accessToken);
    expect(res.statusCode).toBe(200);
  });
});

describe('Test Update User data with avatar upload', () => {
  test('Try update user profile with valid token and data', async () => {
    const jwt = generateJWTToken(USER_ID, '50000ms');
    const accessToken = `Bearer ${jwt}`;
    const res = await request(app)
      .patch('/user/me')
      .set('Authorization', accessToken)
      .field('bike', 'Bmw r1200r')
      .attach('avaFile', './routes/tests/test.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.bike).toBe('Bmw r1200r');
  });
});

// describe('Test request for password recovery', () => {
//   test('Request password recovery with valid Email', async () => {
//     const res = await request(app)
//       .post('/user/forgotpass')
//       .send({ email: 'andrey_pushkin@mail.ru' });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message');
//   });
//   test('Request password recovery with not registred Email', async () => {
//     const res = await request(app)
//       .post('/user/forgotpass')
//       .send({ email: 'invalid@mail.ru' });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty('error');
//   });
//   test('Request password recovery without email', async () => {
//     const res = await request(app)
//       .post('/user/forgotpass')
//       .send({ Noemail: 'andrey_pushkin@mail.ru' });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty('error');
//   });
//   test('Request password recovery with invalid Email', async () => {
//     const res = await request(app)
//       .post('/user/forgotpass')
//       .send({ email: 'andrey_pushkin' });

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty('error');
//   });
// });
