const express = require('express');
const router = express.Router();
const RouteModel = require('../models/route');
const fs = require('fs')

const RouteConverter = require('../controllers/convertroute');
const stream = require('stream')


router.get('/', async (req, res) => {
    console.log(req.query)
    let route = {}
    try {
        route = await RouteModel.findById(req.query.id).lean()
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(400).json({message: 'Маршрут не найден'})
        }
    }
    const routeConverter = RouteConverter(route)
    //console.log('new routeConverter:', routeConverter)
    const gpxStr = routeConverter.convertToGpx()
   // console.log('Get GPX:', gpxStr)
    const buff = Buffer.from(gpxStr, 'utf8')
    const readStream = new stream.PassThrough()
    readStream.end(buff)
    res.set('Content-disposition', 'attachment; filename=file.gpx');
    res.set('Content-type', 'text/plain')
    
    readStream.pipe(res)
    console.log(buff)
    res.status(200)
    // 1 Запросить маршрут БД
    // 2 Предать маршрут в коструктор, получить new convertroute

    // 3 получить gpx 

})

module.exports = router