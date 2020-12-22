const express = require('express');

const router = express.Router();
const RouteModel = require('../models/route')
const UserModel = require('../models/user')


const routeUpload = require('../middleware/routeupload')
const editRouteUpload = require('../middleware/editrouteupload')

const saveFiles = require('../middleware/savefiles')
const updateRoute = require('../middleware/request-route-for-update')

const auth = require('../middleware/auth');
const { findByIdAndDelete } = require('../models/route');


router.use(function timeLog(req, res, next) {
    console.log('Запрос на route Time: ', Date.now());
    
    
   next();
  });

  router.get('/', async (req, res)=>{
        try {
            const routes = await RouteModel.find({}).lean().select('nameTranslit name description avatar')
            console.log(routes)
            res.status(200).send(JSON.stringify(routes))
        } catch (err){
            console.log(err)
        } 
    
      res.status(200)
  })
  
  router.post('/add', auth, routeUpload, async (req, res)=>{
      
    console.log(req.body)
    req.body.author = {
        name: req.user.name,
        email: req.user.email
    }      
    req.body.routeFiles = req.files.routeFiles
    req.body.routeImages = req.files.routeImages
    req.body.points = JSON.parse(req.body.points)
    req.body.routeGeoJson = JSON.parse(req.body.routeGeoJson)
    req.files.routeImages ? req.body.avatar =  req.files.routeImages[0] : req.body.avatar =  {}
    if (req.files.pointImages){
    req.body.points = req.body.points.map(point => {
        point.images = []
        for (let i = 0; i < req.files.pointImages.length; i++){
            if (point.id == req.files.pointImages[i].originalname){
                point.images.push(req.files.pointImages[i])
            }
        }
        return point
    })
    }
      console.log('req.body:',req.body)
    try {
        if (await RouteModel.testName(req.body.nameTranslit)){
            const route = new RouteModel(req.body)
            const doc = await route.save()
            const myRoutes = await UserModel.findById(req.user._id).lean().select('myRoutes')
            console.log(myRoutes)
            myRoutes.myRoutes.push({routeId: doc._id, name: doc.name, nameTranslit: doc.nameTranslit})
            
            await UserModel.findByIdAndUpdate(myRoutes._id, {$set: {myRoutes: myRoutes.myRoutes}})
            console.log(doc._id)
            res.status(201).send({message: 'Маршрут сохранен', routeId: doc._id})
            console.log({message: 'Маршрут сохранен', routeId: doc._id})
        }
    
    } catch (e) {
        res.status(200).send(JSON.stringify(e))
        console.log(e)
    }

   
    
})

router.get('/:id', async (req, res)=>{
    console.log(req.params)
    if (!req.params.id){ res.status(400).json({message: "Нет ID в запросе!"})}
    try{
      const route = await RouteModel.findById(req.params.id)
            res.status(200).json(route)
    } catch(e){
        console.log(e)
    }

    res.status(200)
})
 router.delete('/:routeId', auth, async (req, res) => {
     //проверить автора маршрута
    console.log('delete',req.params.routeId)
    if (!req.params.routeId){ res.status(400).json({message: "Нет ID в запросе!"})}


    try {
        const routeForDelete = await RouteModel.findByIdAndDelete(req.params.routeId)
        console.log(routeForDelete)
        res.status(200).json({message:'Маршрут удален.'})
    } catch(e) {

    }

 })
 router.put('/add/:routeId', auth, editRouteUpload, updateRoute, saveFiles, async (req, res) => {
    //  console.log('routeid:',req.params.routeId)
        const doc = await RouteModel.findByIdAndUpdate(req.params.routeId, req.route, {new: true})
      console.log('route:', doc.points )
      if (doc){
          res.status(200).json({message: 'Изменения сохранены'})
      } else{
        res.status(200).json({message: 'Неизвестная ошибка:('})
      }

 })


module.exports = router;