const st = require('supertest');
const app = require('../../app');
const { addUser, removeUsedByEmail, cookieParser } = require('./helpers');
const mongoose = require('mongoose');
const server = st(app);

const testUser = {
  email: 'mr_tester@mail.ru',
  password: '123456',
  name: 'Mr. Tester',
};

const newUser = {
  email: 'andreytest@mail.ru',
  password: '123456',
  name: 'TestUser',
};

beforeAll(async () => {
  await removeUsedByEmail(newUser.email);
  await removeUsedByEmail(testUser.email);
  await addUser(testUser);
});
afterAll(async () => {
  //await removeUsedByEmail(testUser.email);
  await removeUsedByEmail(newUser.email);
  await mongoose.connection.close();
});
describe('Auth test', () => {
  describe('Test Server Route /login POST', () => {
    test('Try login with valid user /auth/login', async () => {
      const res = await server.post('/auth/login').send(testUser);
      const cookie = cookieParser(res.headers['set-cookie']);
      expect(res.statusCode).toBe(200);
      expect(cookie).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });
    test('Try login with invalid password /auth/login', async () => {
      const userWithInvalidPass = {
        email: 'mr_tester@mail.ru',
        password: 'invalid',
      };
      const res = await server.post('/auth/login').send(userWithInvalidPass);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe(`Не верный пароль!`);
    });
    test('Try login with invalid login /auth/login', async () => {
      const userWithInvalidPass = {
        email: 'invalid@mail.ru',
        password: 'invalid',
      };
      const res = await server.post('/auth/login').send(userWithInvalidPass);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe(
        `Пользователь с ${userWithInvalidPass.email} не найден в базе.`
      );
    });
    test('Try login without requested field /auth/login', async () => {
      const userWithInvalidPass = {
        Noemail: 'mr_tester@mail.ru',
        password: 'invalid',
      };
      const res = await server.post('/auth/login').send(userWithInvalidPass);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe(
        `Поле email или password осутствует в запросе.`
      );
    });
  });

  describe('Test Server Route auth/register POST', () => {
    test('Register valid User', async () => {
      const res = await server.post('/auth/register').send(newUser);
      const cookie = cookieParser(res.headers['set-cookie']);
      expect(res.statusCode).toBe(200);
      expect(cookie).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });
    test('Try register with with already registred User', async () => {
      const alrdRegUser = Object.assign(testUser, { name: 'tester' });
      const res = await server.post('/auth/register').send(alrdRegUser);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe(
        `Пользователь с ${alrdRegUser.email} уже зарегестрирован.`
      );
    });
  });

  describe('Test Server Route auth/logout POST', () => {
    test('Logout with valid token', async () => {
      // Login for cookie
      const login = await server.post('/auth/login').send(testUser);
      expect(login.statusCode).toBe(200);
      const cookie = cookieParser(login.headers['set-cookie']);
      const jwt = login.body.token;
      const accessToken = `Bearer ${jwt}`;
      // Do request for Logout with cookie
      const logout = await server
        .get('/auth/logout')
        .set('Authorization', accessToken)
        .set('Cookie', `refreshToken=${cookie.refreshToken}`);
      expect(logout.statusCode).toBe(200);
      expect(logout.body).toHaveProperty('message');
      // Try to use refreshToken after logout
      const res = await server
        .get('/auth/refreshtoken')
        .set('Authorization', accessToken)
        .set('Cookie', `refreshToken=${cookie.refreshToken}`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Test Server Route auth/refreshToken GET', () => {
    test('Refresh JWT Token with valid refresh token', async () => {
      // Login for cookie
      const login = await server.post('/auth/login').send(testUser);
      expect(login.statusCode).toBe(200);
      // Try refreshToken
      const cookie = cookieParser(login.headers['set-cookie']);
      const res = await server
        .get('/auth/refreshtoken')
        .set('Cookie', `refreshToken=${cookie.refreshToken}`);
      const resCookie = cookieParser(res.headers['set-cookie']);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(resCookie).toHaveProperty('refreshToken');
    });
    test('Try Refresh JWT Token without refresh token in cookie', async () => {
      const res = await server
        .get('/auth/refreshtoken')
        .set('Cookie', `notToken=notoken`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Нет токена в запросе');
    });
    test('Try Refresh JWT Token with invalid refreshToken', async () => {
      const res = await server
        .get('/auth/refreshtoken')
        .set('Cookie', `refreshToken=invalidtoken`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Не верный Токен');
    });
  });

  describe('Test Server Route LogoutAll GET', () => {
    test('Logout all with valid token', async () => {
      // Login 1 device for cookie
      const firstLogin = await server.post('/auth/login').send(testUser);
      expect(firstLogin.statusCode).toBe(200);
      const firstCookie = cookieParser(firstLogin.headers['set-cookie']);
      const firstJwt = firstLogin.body.token;
      const firstAccessToken = `Bearer ${firstJwt}`;
      // Login 2 device for cookie
      const secondlogin = await server.post('/auth/login').send(testUser);
      expect(secondlogin.statusCode).toBe(200);
      const secondCookie = cookieParser(secondlogin.headers['set-cookie']);
      const secondJwt = secondlogin.body.token;
      const secondAccessToken = `Bearer ${secondJwt}`;
      // Do request for Logout All device with cookie
      const logout = await server
        .get('/auth/logoutall')
        .set('Authorization', firstAccessToken)
        .set('Cookie', `refreshToken=${firstCookie.refreshToken}`);
      expect(logout.statusCode).toBe(200);
      expect(logout.body).toHaveProperty('message');
      // Try to use refreshToken after logout
      const res = await server
        .get('/auth/refreshtoken')
        .set('Authorization', secondAccessToken)
        .set('Cookie', `refreshToken=${secondCookie.refreshToken}`);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
