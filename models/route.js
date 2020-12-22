const mongoose = require('mongoose');
//const { stringify } = require('uuid');





const routemodel = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameTranslit: {
        type: String,
        required: true,
        trim: true
    },
    routeLength: {
        type: Number,
        required: true,
    },
    difficult: {
        type: String,
        required: true
    },
    duration: {
        type: Number
    },
    type: {
        type: String,
        required: true
    },
    bikeType: String,
    description: {
        type: String,
        required: true,

    },
    points:{
        type: Object        
        
    },
    routeGeoJson: {
        type: Object
        
    },
    routeFiles: [Object],
    routeImages:[Object],
    avatar: Object,
    meta: {
        votes: Number,
        
    },
    author: Object,
    comments:[{
        body: String,
        author: String,
        date: Date
    }],
    date: Date

})

routemodel.statics.findRouteByNameTranslit = async (nameTranslit) => {
    const route = await RouteModel.find({nameTranslit})
    if (route) {
        return route
    }
    return null 
}

routemodel.statics.checkAuthor = async (routeId, userId) => {
        
}

routemodel.statics.testName = async (nameTranslit) => {
    const route = await RouteModel.findOne({nameTranslit})
     
    if (route) {
        throw {message: 'Маршрут с таким названием уже есть в базе'}
    }
    return true 
}

const RouteModel = mongoose.model('RouteModel', routemodel);
module.exports = RouteModel