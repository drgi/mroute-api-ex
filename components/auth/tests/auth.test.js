const authApi = require('../auth.api');
const connectToDB = require('../../../db/db');
const mongoose = require('mongoose');
const dbURL = 'mongodb://localhost:27017/mroute-tests';
let db;
beforeAll(async () => {
  mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (let collectionsName of collections) {
    const collection = mongoose.connection.collections[collectionsName];
    try {
      await collection.drop();
    } catch (error) {
      if (error.message === 'ns not found') return;
      if (error.message.includes('a background operation is currently running'))
        return;

      // console.log(error.message);
    }
  }
  mongoose.connection.close();
});

describe('Register test', () => {
  test('Register new User with valid data', async () => {
    const newUser = {
      email: 'andrey_pushkin@mail.ru',
      password: '123456',
      name: 'TestUser',
    };
    const result = await authApi.register(newUser);
    expect(result.error).toBeNull();
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refreshToken');
  });

  test('Register new User, already registred', async () => {
    const newUser = {
      email: 'andrey_pushkin@mail.ru',
      password: '123456',
      name: 'TestUser',
    };
    const result = await authApi.register(newUser);
    expect(result.error).toBe(
      'Пользователь с andrey_pushkin@mail.ru уже зарегестрирован.'
    );
  });

  test('Register new User without required field', async () => {
    const newUser = {
      notEmail: 'andrey_pushkin@mail.ru',
      password: '123456',
      name: 'TestUser',
    };
    const result = await authApi.register(newUser);
    expect(result.error).toBe(`Обязательных полей email нет в запросе.`);
  });
});

describe('Login test', () => {
  test('Login function with valid credential', async () => {
    const credential = { email: 'andrey_pushkin@mail.ru', password: '123456' };
    const result = await authApi.login(credential.email, credential.password);
    expect(result.error).toBeNull();
    expect(typeof result.user === 'object').toBeTruthy();
    expect(typeof result.token === 'string').toBeTruthy();
    expect(typeof result.refreshToken === 'string').toBeTruthy();
  });

  test('Login function with ivalid Password', async () => {
    const credential = { email: 'andrey_pushkin@mail.ru', password: 'invalid' };
    const result = await authApi.login(credential.email, credential.password);
    expect(result.error).toBe(`Не верный пароль!`);
  });

  test('Login function with ivalid Email', async () => {
    const credential = { email: 'invalid@mail.ru', password: '123456' };
    const result = await authApi.login(credential.email, credential.password);
    expect(result.error).toBe(
      `Пользователь с ${credential.email} не найден в базе.`
    );
  });
});

describe('Logout', () => {
  test('Logout with valid user ID and refreshToken', async () => {
    const credential = { email: 'andrey_pushkin@mail.ru', password: '123456' };
    const result = await authApi.login(credential.email, credential.password);
    expect(result.error).toBeNull();
    const id = result.user._id;
    const { refreshToken } = result;
    const logout = await authApi.logout(id, refreshToken);
    expect(logout.ok).toBeTruthy();
  });
  test('Logout with invalid user ID ', async () => {
    const credential = { email: 'andrey_pushkin@mail.ru', password: '123456' };
    const result = await authApi.login(credential.email, credential.password);
    expect(result.error).toBeNull();
    const id = 'invalid';
    const { refreshToken } = result;
    const logout = await authApi.logout(id, refreshToken);
    expect(logout.error).toBe(`Пользователь с ${id} не найден.`);
  });
});
