const express = require('express');
const avatarUpload = require('../middleware/avatarupload');

const router = express.Router();
const UserModel = require('../models/user');
const RouteModel = require('../models/route');
const auth = require('../middleware/auth');

const transporter = require('../utils/mailer/mailer');

require('dotenv').config();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// GET wats user?
router.get('/me', auth, async function (req, res) {
  const user = req.user.responseData();
  res
    .status(200)
    .json({ user, token: req.token, message: `Здравствуйте, ${user.name}` });
});

//User profile change
router.patch('/me', auth, avatarUpload, async (req, res) => {
  if (req.files.avaFile) {
    req.body.avatar = req.files.avaFile[0].path;
  }
  //console.log('body:',req.user)
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { ...req.body },
      { new: true, lean: false }
    ).select('-password -tokens');
    //console.log(user)
    user.token = req.token;
    const responseUserData = user.responseData();
    res.status(200).json({ user: responseUserData, token: req.token });
  } catch (e) {
    console.log(e);
  }
});

///FIle Upload(avatar img)
// router.post('/me',auth, upload.array('files', 5),async (req, res)=>{
//   console.log(req.body)
//   console.log(req.files)
//   req.user.avatar = req.files[0].path
//   await req.user.save()

// })

// POST login route
router.post('/login', async (req, res) => {
  try {
    console.log(`Запрос:${req.body}`);
    const user = await UserModel.FindUserForAuth({ ...req.body });
    console.log(user);
    if (!user) {
      res.status(401).send(JSON.stringify({ error: 'Ошибка Авторизации' }));
    }
    const token = await user.GenerateToken();
    const responseUserData = user.responseData();
    res.status(200).send(JSON.stringify({ user: responseUserData, token }));
  } catch (error) {
    console.log(error);
    res.status(400).send(JSON.stringify({ error: error.message }));
  }
});
///POST Singup
router.post('/singup', async (req, res) => {
  try {
    console.log(req.body);
    const user = new UserModel(req.body);
    await user.save();
    const token = await user.GenerateToken();
    const responseUserData = user.responseData();
    res
      .status(201)
      .send(
        JSON.stringify({
          user: responseUserData,
          token,
          message: 'Вы успешно зарегестрированны!',
        })
      );
  } catch (error) {
    if (error.driver) {
      res
        .status(400)
        .send(JSON.stringify({ error: `Этот Email уже зарегистрирован` }));
    }
    //  if(error.message){
    //   res.status(208).send(JSON.stringify({error: `Введите верный Email`}))
    //  }
  }
});
///Post logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token != req.token);
    await req.user.save();
    res.status(401).send(JSON.stringify({ message: 'Вы вышли из системы!' }));
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
});
///Get logout all device
router.get('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.status(200).send(JSON.stringify({ message: 'Вы вышли из системы!' }));
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
});
//Get UserRoutes
router.get('/myroutes', auth, async (req, res) => {
  try {
    //const docs = await RouteModel.find({_id: routeIds}).lean().select('nameTranslit name description avatar')
    const docs = await RouteModel.find({
      'author.email': req.user.email,
      isDraft: false,
    })
      .lean()
      .select('nameTranslit name description avatar');
    // console.log('docs2', docs2)
    if (docs.length > 0) {
      res.status(200).json(docs);
    } else {
      res.status(200).json([]);
    }
  } catch (e) {
    console.log(e);
  }
});
// Get user routedrafts
router.get('/myroutedrafts', auth, async (req, res) => {
  try {
    //const docs = await RouteModel.find({_id: routeIds}).lean().select('nameTranslit name description avatar')
    const docs = await RouteModel.find({
      'author.email': req.user.email,
      isDraft: true,
    })
      .lean()
      .select('nameTranslit name description avatar')
      .sort({ dateCreation: -1 });
    console.log('drafts:', docs);
    if (docs.length > 0) {
      res.status(200).json(docs);
    } else {
      res.status(200).json([]);
    }
  } catch (e) {
    console.log(e);
  }
});
// Forgot Password
// Запрос на сброс пароля по емаил, генерация токена на час, отправка письма с ссылкой на сброс пароля
router.post('/forgotpass', async (req, res) => {
  // 1. забрать мыло из запроса, найти в базе
  console.log(req.body.email);
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    res.status(401).json({ message: `Такого Email ${req.body.email}, нет!!` });
  }
  // 2. Сгенерировать токен generateTokenForPassReset
  user.generateTokenForPassReset();
  // 3. составить шаблон письма
  const mailData = {
    to: user.email,
    from: 'mail@moto-route.ru',
    template: 'forgot-password-email',
    subject: 'Сброс пароля',
    context: {
      url: `${process.env.HOST}/user/resetpassword/?key=${user.resetPasswordToken}`,
      name: user.name,
    },
  };

  // 4. Засейвит юзера, отправить письмо с ссылкой
  user
    .save()
    .then((user) => {
      transporter.sendMail(mailData, function (err) {
        if (err) {
          console.log('Email not send', err);
        } else {
          console.log('Email вроде отправлен');
          res
            .status(200)
            .json({
              message: `Вам на почту ${user.email} отравлено письмо для смены пароля!`,
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // 5. Дать ответ клиенту res.json
});
///Reset password
router.get('/resetpassword', async (req, res) => {
  console.log(req.query);
  //1. Запрос в базе по ключу и проверка срока действия
  const user = await UserModel.findOne({
    resetPasswordToken: req.query.key,
    resetPasswordExp: { $gt: Date.now() },
  });
  if (!user) {
    console.log('User not Found or Expired');
    return res
      .status(401)
      .json({ message: 'Пользователь не найден или итек срок' });
  }
  //2. Генерация нового пароля и сброс всех токенов
  user.generateTempPassword();
  console.log(user);
  const mailData = {
    to: user.email,
    from: 'mail@moto-route.ru',
    template: 'reset-password-email',
    subject: 'Новый пароль',
    context: {
      email: user.email,
      name: user.name,
      password: user.password,
    },
  };
  //3. Запись в базу и составить шаблон письма
  user
    .save()
    .then((user) => {
      transporter.sendMail(mailData, function (err) {
        if (err) {
          console.log('Email not send', err);
        } else {
          console.log('Email с новым паролем вроде отправлен');
          //res.status(200).json({message: `Вам на почту ${user.email} отравлено письмо с новым паролем пароля!`})
          const url =
            process.env.FRONT_HOST +
            `/login?message=Вам на почту ${user.email} отравлено письмо с новым паролем пароля!`;
          res.status(200).redirect(url);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  //4. Если все ок отправка письма и статус 200 и редирект на мотороут
});
router.post('/changepassword', auth, async (req, res) => {
  console.log('Body', req.body);
  //1. Найти юзера в базу и сверить старый пароль
  let user = null;
  try {
    user = await UserModel.FindUserForAuth({
      email: req.body.email,
      password: req.body.oldPass,
    });
    console.log(user);
  } catch (error) {
    console.log(error);
    res.status(400).send(JSON.stringify({ message: error.message }));
  }
  //2. Сменить пароль
  if (user) {
    user.changePassword(req.body.newPass);
  }
  //3. Сохранить в базе и ответить клиенту
  user
    .save()
    .then((user) => {
      res.status(200).json({ message: 'Ваш пароль успешно изменен!' });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ message: 'Ошибка не сервере' });
    });
});

module.exports = router;
