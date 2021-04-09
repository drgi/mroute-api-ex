const express = require('express');
const { verifyJWTMiddleware } = require('../components/auth');
const router = express.Router();
const RouteModel = require('../models/route');
const UserModel = require('../models/user');

const routeUpload = require('../middleware/routeupload');
const editRouteUpload = require('../middleware/editrouteupload');

const saveFiles = require('../middleware/savefiles');
const updateRoute = require('../middleware/request-route-for-update');

const auth = require('../middleware/auth');
////////////// new
const RouteRequest = require('../components/moto-route/Route-Request');
const MRoute = require('../components/moto-route');

router.use(function timeLog(req, res, next) {
  console.log('Запрос на route Time: ', Date.now());
  next();
});

router.post('/', async (req, res, next) => {
  //1 Определить, запрос, если пустой вернуть по новой дате
  //2 Распарсить запрос, создать обЪект для запроса
  //3 Вернуть найденное или сообшение не найдено
  try {
    const request = new RouteRequest(req);
    const routes = await new MRoute(request).getRoutesCardByParams();
    console.log('Routes length', routes.length);
    return res.status(200).json(routes);
  } catch (err) {
    next(err);
    return;
  }

  // const params = req.body;
  // const queryParams = { isDraft: false };
  // if (!params.noParams) {
  //   for (let key in params) {
  //     if (params[key]) {
  //       queryParams[key] =
  //         key === 'name' ? { $regex: params[key], $options: 'i' } : params[key];
  //     }
  //   }
  // }
  // console.log('To base query:', queryParams);
  // try {
  //   const routes = await RouteModel.find(queryParams)
  //     .lean()
  //     .select('nameTranslit name description avatar');
  //   res.status(200).json(routes);
  // } catch (err) {
  //   console.log(err);
  // }

  // res.status(200);
});
//Создание/добавление нового черновика
router.post('/adddraft', verifyJWTMiddleware, async (req, res, next) => {
  //1. Принять Имя маршрута и автор маршрута
  //2. Создать запись в базе, создать папки, добавить автора, флаг черновика!
  try {
    const request = new RouteRequest(req);
    const mroute = new MRoute(request);
    const routeDraft = await mroute.createRouteDraft();
    return res
      .status(200)
      .json({ routeDraft, message: 'Создан черновик маршрута' });
  } catch (err) {
    console.log('AddrouteDraft', err);
    next(err);
  }

  // try {
  //   const route = await RouteModel({ ...req.body, isDraft: true });
  //   route.mkRouteDirectory();
  //   await route.save({ validateBeforeSave: false });
  //   if (route) {
  //     res
  //       .status(200)
  //       .json({ routeDraft: route, message: 'Создан черновик маршрута' });
  //   }
  // } catch (err) {
  //   console.log(err);
  //   next(err);
  // }
  //3. Сохранить в базе, ответить клиенту ИД, название
});
//Добавление маршрута старый эндпоинт
router.post('/add', auth, routeUpload, async (req, res) => {
  console.log(req.body);
  req.body.author = {
    name: req.user.name,
    email: req.user.email,
  };
  req.body.isDraft = false;
  req.body.routeFiles = req.files.routeFiles;
  req.body.routeImages = req.files.routeImages;
  req.body.points = JSON.parse(req.body.points);
  req.body.routeGeoJson = JSON.parse(req.body.routeGeoJson);
  req.files.routeImages
    ? (req.body.avatar = req.files.routeImages[0])
    : (req.body.avatar = {});
  if (req.files.pointImages) {
    req.body.points = req.body.points.map((point) => {
      point.images = [];
      for (let i = 0; i < req.files.pointImages.length; i++) {
        if (point.id == req.files.pointImages[i].originalname) {
          point.images.push(req.files.pointImages[i]);
        }
      }
      return point;
    });
  }
  console.log('req.body:', req.body);
  try {
    if (await RouteModel.testName(req.body.nameTranslit)) {
      const route = new RouteModel(req.body);
      const doc = await route.save();
      const myRoutes = await UserModel.findById(req.user._id)
        .lean()
        .select('myRoutes');
      console.log(myRoutes);
      myRoutes.myRoutes.push({
        routeId: doc._id,
        name: doc.name,
        nameTranslit: doc.nameTranslit,
      });

      await UserModel.findByIdAndUpdate(myRoutes._id, {
        $set: { myRoutes: myRoutes.myRoutes },
      });
      console.log(doc._id);
      res.status(201).send({ message: 'Маршрут сохранен', routeId: doc._id });
      console.log({ message: 'Маршрут сохранен', routeId: doc._id });
    }
  } catch (e) {
    res.status(200).send(JSON.stringify(e));
    console.log(e);
  }
});

router.get('/:routeId', async (req, res, next) => {
  console.log(req.params);
  // if (!req.params.routeId) {
  //   res.status(400).json({ message: 'Нет ID в запросе!' });
  // }
  // try {
  //   const route = await RouteModel.findById(req.params.id);
  //   res.status(200).json(route);
  // } catch (e) {
  //   console.log(e);
  // }
  // res.status(200);
  try {
    const request = new RouteRequest(req);
    const route = await new MRoute(request).getRouteDataFromDbById();
    return res.status(200).json(route);
  } catch (err) {
    console.log('/:RouteId Error', err);
    next(err);
  }
});
router.delete('/:routeId', verifyJWTMiddleware, async (req, res, next) => {
  //проверить автора маршрута
  //[x] Удаление ПАПОК!!!!!!
  console.log('delete', req.params.routeId);
  try {
    const request = new RouteRequest(req);
    const route = new MRoute(request);
    //await route.deleteRouteDir()
    await route.deleteRouteById();
    return res.status(200).json({ message: 'Маршрут удален.' });
  } catch (err) {
    console.log('Route DELETE Error:', err);
    next(err);
  }
  // if (!req.params.routeId) {
  //   res.status(400).json({ message: 'Нет ID в запросе!' });
  // }
  // try {
  //   const routeForDelete = await RouteModel.findOneAndDelete({
  //     _id: req.params.routeId,
  //   });
  //   if (routeForDelete.deleteRouteDir()) {
  //     res.status(200).json({ message: 'Маршрут удален.' });
  //   } else {
  //     res.status(400).json({ message: 'Ошибка удаления каталога' });
  //   }
  // } catch (e) {
  //   console.log(e);
  //   next(e);
  // }
});
router.put('/add/:routeId', auth, async (req, res, next) => {
  try {
    const request = new RouteRequest(req);
    //console.dir({ request }, { depth: null });
    const mroute = new MRoute(request);
    const draft = await mroute.addChangesToRouteDraft();
    //console.log('Updated route draft: ', draft);
    if (draft) {
      res.status(200).json({ message: 'Изменения сохранены' });
    } else {
      res.status(200).json({ message: 'Неизвестная ошибка:(' });
    }
  } catch (err) {
    console.log('Put Route Error: ', err.message);
    next(err);
    // let e = err.message.match(/-[а-я0-9\s]+/gi);
    // e = e.map((line) => `<li>${line}</li>`);
    // res.status(200).json({
    //   message: `<ul><h6>Публикация не возможна!</h6>${e.join('')}</ul>`,
    // });
  }

  //console.log('id', req.params.routeId)
  //console.log('flag:', req.query.isDraft)
  // const routeForSubmit = req.body;
  // const isDraft =
  //   req.query.isDraft === 'true'
  //     ? true
  //     : req.query.isDraft === 'false'
  //     ? false
  //     : null;
  // if (isDraft === null) {
  //   return res.status(200).json({ error: 'Не верные параметры запроса' });
  // }
  // if (req.params.routeId === 'null') {
  //   return res
  //     .status(200)
  //     .json({ error: 'Ошибка, сначала создайте черновик маршрута' });
  // }
  // try {
  //   const route = await RouteModel.findById(req.params.routeId);
  //   for (let key in routeForSubmit) {
  //     route[key] = routeForSubmit[key];
  //   }
  //   if (!isDraft) await route.validate();
  //   console.log('afterVali');
  //   route.isDraft = isDraft;
  //   await route.save({ validateBeforeSave: false });
  //   if (route) {
  //     res.status(200).json({ message: 'Изменения сохранены' });
  //   } else {
  //     res.status(200).json({ message: 'Неизвестная ошибка:(' });
  //   }
  // } catch (err) {
  //   //console.log(err)
  //   let e = err.message.match(/-[а-я0-9\s]+/gi);
  //   e = e.map((line) => `<li>${line}</li>`);
  //   res.status(200).json({
  //     message: `<ul><h6>Публикация не возможна!</h6>${e.join('')}</ul>`,
  //   });
  // }
});
//Опубликовать маршрут
///////////////////////////////////////
router.get('/submitdraft', auth, (req, res) => {
  //1. Найти маршрут в базе
  //2. Валидировать
  //3. Сохранить с валидацией
});

//////Добавление и удаление файлов к маршруту
router.post(
  '/images',
  verifyJWTMiddleware,
  editRouteUpload,
  async (req, res, next) => {
    //1. Найти по ИД в базе
    try {
      const request = new RouteRequest(req);
      const mroute = new MRoute(request);
      const routeImagesUrls = await mroute.addImagesToRoute();
      console.log('Upload imagees:', routeImagesUrls);
      res.status(200).json({
        routeImages: routeImagesUrls,
        message: 'Файлы добавлены',
      });
    } catch (err) {
      console.log('Route images Add Error: ', err);
      next(err);
    }

    // RouteModel.findById(req.body.routeId, function (err, route) {
    //   if (err) {
    //     return res
    //       .status(400)
    //       .json({ message: 'Маршрут не найден, создайте черновик' });
    //   }
    //   route.uploadFiles(req.files, req.body.pointId);
    //   route.save({ validateBeforeSave: false }, function (err, route) {
    //     if (err) {
    //       console.log(err);
    //       return res.status(400).json({ message: 'Ошибка сохранения' });
    //     }
    //     if (route) {
    //       res.status(200).json({
    //         routeImages: route.routeImages,
    //         message: 'Файлы добавлены',
    //       });
    //     }
    //   });
    // });
    //2. Записать файлы вернуть массив с путями
    //3. Вернуть массив с путями клиенту
  }
);
router.delete('/images/del', (req, res) => {
  //1. Найти по ИД в базе
  RouteModel.findById(req.body.routeId, function (err, route) {
    if (err || !route) {
      return res.status(400).json({ message: 'Маршрут не найден' });
    }
    if (route.deleteFile(req.body.file)) {
      route.save({ validateBeforeSave: false }, function (err, route) {
        if (err) {
          console.log(err);
          return res.status(400).json({ message: 'Ошибка сохранения' });
        }
        if (route) {
          res
            .status(200)
            .json({ routeImages: route.routeImages, message: 'Файл удален' });
        }
      });
    }
  });
  //2. Удалить файлы
  //3. фильтрануть массив с путями
  //3. Вернуть массив с путями клиенту
});
router.post('/pointimages', auth, editRouteUpload, (req, res) => {
  //1. Найти по ИД в базе
  RouteModel.findById(req.body.routeId, function (err, route) {
    if (err) {
      return res
        .status(400)
        .json({ message: 'Маршрут не найден, создайте черновик' });
    }
    let files = route.uploadFiles(req.files, req.body.pointId);
    route.points = route.points.map((point) => {
      if (point.id == req.body.pointId) {
        point.images = point.images.concat(files);
        files = point.images;
        return point;
      }
      return point;
    });
    route.markModified('points');
    route.save({ validateBeforeSave: false }, function (err, route) {
      if (err) {
        console.log(err);
        return res.status(400).json({ message: 'Ошибка сохранения' });
      }
      if (route) {
        res
          .status(200)
          .json({ pointImages: files, message: 'Файлы добавлены' });
      }
    });
  });
  //2. Записать файлы вернуть массив с путями
  //3. Вернуть массив с путями клиенту
});
router.delete('/pointimages/del', async (req, res) => {
  // console.log(req.body)
  //1. Найти по ИД в базе
  let images = [];
  let route = await RouteModel.findById(req.body.routeId);
  route.points = route.points.map((point) => {
    if (point.id == req.body.pointId) {
      images = point.images = point.images.filter(
        (image) => image.path != req.body.file.path
      );
      return point;
    }
    return point;
  });
  route.markModified('points');
  await route.save({ validateBeforeSave: false });
  if (route) {
    console.log(route.points[0].images);
    res.status(200).json({ pointImages: images, message: 'Файл удален' });
  }
});
// Удаление точки маршута и папки точки
router.delete('/point/del', async (req, res) => {
  console.log(req.body);
  //1 Найти в базе
  let route;
  try {
    route = await RouteModel.findById(req.body.routeId);
    if (!route) {
      throw {
        message: 'Маршрут не найден на сервере, возможно вы его не создали?',
      };
    }
  } catch (e) {
    console.log(e);
    return res.status(200).json(e);
  }
  //2 Сделать метод в модели по удалению папки и из массива точек
  if (route.deletePoint(req.body.pointId)) {
    route.save({ validateBeforeSave: false });
    return res.status(200).json({ message: 'Точка удалена' });
  }
  return res.status(200);
});
module.exports = router;
