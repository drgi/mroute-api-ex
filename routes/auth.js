const express = require('express');
const router = express.Router();
const {
  login,
  register,
  verifyJWTMiddleware,
  logout,
  refreshJWTToken,
  logoutAll,
} = require('../components/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: `Поле email или password осутствует в запросе.` });
  }
  try {
    const result = await login(email, password);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    //Add cookie
    const { user, token, refreshToken } = result;
    // * Refactor
    res.cookie('refreshToken', refreshToken, {
      maxAge: 9999999999,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    //res client
    return res.status(200).json({ user, token });
  } catch (e) {
    console.log('Login error', e);
    return res.status(400).json({ Error: e.message });
  }
});

router.post('/register', async (req, res) => {
  //console.log('Register cookie: ', req.cookies);
  const newUser = req.body;
  try {
    const result = await register(newUser);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    const { user, token, refreshToken } = result;
    // * Refactor
    res.cookie('refreshToken', refreshToken, {
      maxAge: 9999999999,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    //res client
    return res.status(200).json({ user, token });
  } catch (err) {
    console.log('Register error', e);
    return res.status(400).json({ error: e.message });
  }
});

router.get('/logout', verifyJWTMiddleware, async (req, res) => {
  const { refreshToken } = req.cookies;
  if (req.authError) {
    return res.status(401).json({ error: req.authError });
  }
  const { userId } = req;
  try {
    const result = await logout(userId, refreshToken);
    if (result.ok) {
      return res.status(200).json({ message: 'Вы вышли из системы)' });
    }
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.log('Logout error', e);
    return res.status(400).json({ Error: e.message });
  }
});

router.get('/logoutall', verifyJWTMiddleware, async (req, res) => {
  //console.log('Logoutall cookie: ', req.cookies);
  if (req.authError) {
    return res.status(401).json({ error: req.authError });
  }
  const { userId } = req;
  try {
    const result = await logoutAll(userId);
    if (result.ok) {
      return res
        .status(200)
        .json({ message: 'Вы вышли из системы на всех устройствах)' });
    }
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.log('Logout error', e);
    return res.status(400).json({ Error: e.message });
  }
});

router.get('/refreshtoken', async (req, res) => {
  //console.log('refreshtoken cookie: ', req.cookies);
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Нет токена в запросе' });
  }
  const result = await refreshJWTToken(refreshToken);
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  const { token, newRefreshToken } = result;
  res.cookie('refreshToken', newRefreshToken, {
    maxAge: 9999999999,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  return res.status(200).json({ token });
});

module.exports = router;
