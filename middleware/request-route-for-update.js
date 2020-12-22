const RouteModel = require('../models/route')
const upload = require('./fileupload')
//const RouteModel = require('../models/route')

async function  updateRoute(req, res, next){
    console.log('updateRoute',req.params.routeId)
    req.body.points = JSON.parse(req.body.points)
    req.body.routeGeoJson = JSON.parse(req.body.routeGeoJson)
    req.body.author = JSON.parse(req.body.author)
    req.body.routeImages = JSON.parse(req.body.routeImagesUrl)
    const route = await RouteModel.findOneAndUpdate(
        {_id: req.params.routeId},
        req.body,
        {new: true}
        )
    if (route){
        req.route = route
    } else {
        throw new Error('Маршрут для изменения не найден')
    }
    
    next()
}

module.exports = updateRoute