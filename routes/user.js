const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const auth = require('../middleware/auth');
const { verifyJWTMiddleware } = require('../components/auth');

const transporter = require('../utils/mailer/mailer');

const {
  getUserProfileById,
  getUserRoute,
  getUserRouteDrafts,
  parseFormDataAndFile,
  patchUserProfile,
  requestPassRecovery,
  resetUserPassword,
} = require('../components/user');

require('dotenv').config();

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

// GET wats user?
router.get('/me', verifyJWTMiddleware, async function (req, res) {
  const { userId, authError } = req;
  if (authError) {
    return res.status(401).json({ error: 'Вы не авторизированны' });
  }
  const result = await getUserProfileById(userId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  if (result.user) {
    return res.status(200).json({ user: result.user });
  }
});

//User profile change
router.patch(
  '/me',
  verifyJWTMiddleware,
  parseFormDataAndFile,
  async (req, res) => {
    if (req.authError) {
      return res.status(401).json({ error: 'Вы не авторизированны' });
    }
    const { userId } = req;
    const fieldForUpdate = { ...req.body };
    const avaFile = req.files.avaFile ? req.files.avaFile[0] : null;
    //console.log('Avafile', avaFile);

    try {
      const result = await patchUserProfile(userId, fieldForUpdate, avaFile);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      if (result.user) {
        return res.status(200).json({ user: result.user });
      }
    } catch (err) {
      console.log('/me PATCH Error', err.message);
      return res.status(400).json({ error: err.message });
    }
    // if (req.files.avaFile) {
    //   req.body.avatar = req.files.avaFile[0].path;
    // }
    // console.log('body:', req.user);
    // try {
    //   const user = await UserModel.findByIdAndUpdate(
    //     req.user.id,
    //     { ...req.body },
    //     { new: true, lean: false }
    //   ).select('-password -tokens');
    //   //console.log(user)
    //   user.token = req.token;
    //   const responseUserData = user.responseData();
    //   res.status(200).json({ user: responseUserData, token: req.token });
    // } catch (e) {
    //   console.log(e);
    // }
  }
);

///FIle Upload(avatar img)
// router.post('/me',auth, upload.array('files', 5),async (req, res)=>{
//   console.log(req.body)
//   console.log(req.files)
//   req.user.avatar = req.files[0].path
//   await req.user.save()

// })

// POST login route
// router.post('/login', async (req, res) => {
//   try {
//     console.log(`Запрос:${req.body}`);
//     const user = await UserModel.FindUserForAuth({ ...req.body });
//     console.log(user);
//     if (!user) {
//       res.status(401).send(JSON.stringify({ error: 'Ошибка Авторизации' }));
//     }
//     const token = await user.GenerateToken();
//     const responseUserData = user.responseData();
//     res.status(200).send(JSON.stringify({ user: responseUserData, token }));
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(JSON.stringify({ error: error.message }));
//   }
// });
///POST Singup
// router.post('/singup', async (req, res) => {
//   try {
//     console.log(req.body);
//     const user = new UserModel(req.body);
//     await user.save();
//     const token = await user.GenerateToken();
//     const responseUserData = user.responseData();
//     res.status(201).send(
//       JSON.stringify({
//         user: responseUserData,
//         token,
//         message: 'Вы успешно зарегестрированны!',
//       })
//     );
//   } catch (error) {
//     if (error.driver) {
//       res
//         .status(400)
//         .send(JSON.stringify({ error: `Этот Email уже зарегистрирован` }));
//     }
//     //  if(error.message){
//     //   res.status(208).send(JSON.stringify({error: `Введите верный Email`}))
//     //  }
//   }
// });
///Post logout
// router.post('/logout', auth, async (req, res) => {
//   try {
//     req.user.tokens = req.user.tokens.filter((token) => token != req.token);
//     await req.user.save();
//     return res
//       .status(401)
//       .send(JSON.stringify({ message: 'Вы вышли из системы!' }));
//   } catch (err) {
//     res.status(500).send(JSON.stringify(err));
//   }
// });
// ///Get logout all device
// router.get('/logoutall', auth, async (req, res) => {
//   try {
//     req.user.tokens.splice(0, req.user.tokens.length);
//     await req.user.save();
//     res.status(200).send(JSON.stringify({ message: 'Вы вышли из системы!' }));
//   } catch (err) {
//     res.status(500).send(JSON.stringify(err));
//   }
// });
//Get UserRoutes
router.get('/myroutes', verifyJWTMiddleware, async (req, res) => {
  const { userId, authError } = req;
  if (authError) {
    return res.status(401).json({ error: authError });
  }
  try {
    const result = await getUserRoute(userId);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    const { routes } = result;
    return res.status(200).json(routes);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
// Get user routedrafts
router.get('/myroutedrafts', verifyJWTMiddleware, async (req, res, next) => {
  const { userId, authError } = req;
  if (authError) {
    return res.status(401).json({ error: authError });
  }
  try {
    const result = await getUserRouteDrafts(userId);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    const { routes } = result;
    return res.status(200).json(routes);
  } catch (err) {
    next(err);
  }
});
// Forgot Password
// Запрос на сброс пароля по емаил, генерация токена на час, отправка письма с ссылкой на сброс пароля
router.post('/forgotpass', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'В запросе нет поля с Email:(' });
  }
  try {
    const result = await requestPassRecovery(email);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    if (result.succes) {
      return res.status(200).json({
        message: `На почту ${email}, было отпарвлено письно для сброса пароля`,
      });
    }
  } catch (err) {
    console.log('/forgotpass Error: ', err);
    return res.status(500).json({ error: `Unknown Error on Server...` });
  }
});
///Reset password
router.get('/resetpassword', async (req, res) => {
  console.log(req.query);
  const url = (message) => `${process.env.FRONT_HOST}/login?message=${message}`;
  const { key } = req.query;
  if (!key) {
    return res.redirect(url('Не верный запрос:('));
  }
  try {
    const result = await resetUserPassword(key);
    if (result.error) {
      return res.redirect(url(result.error));
    }
    if (result.succes) {
      return res.redirect(
        url('Вам на почту выслан новый пароль! Вы можете сменить пароль в ЛК.')
      );
    }
  } catch (err) {
    console.log('/resetPassword Error', err);
    return res.status(500).json({ error: 'Unknown Server Error' });
  }
});

module.exports = router;
