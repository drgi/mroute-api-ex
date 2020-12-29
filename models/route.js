const mongoose = require('mongoose');
const fs = require('fs')
const rimRaf = require('rimraf');
const path = require('path')

//const { stringify } = require('uuid');
const defaultImage = {
    destination: "./public/routes/shri-lanka/routeImages",
    filename: "1607613555098.jpg",
    path: "public/images/no-image.png"
    }
const Point = mongoose.Schema({
    id: String,
    lnglat: Array,
    title: {
        type: String,
        required: [true, '-Введите названия точек']        
    },
    routeble: Boolean,
    description: String,
    images: Array,
    icon: String
}, {_id: false})



const routemodel = mongoose.Schema({
    name: {
        type: String,
        required: [true, '-Укажите название маршрута'],
        trim: true
    },
    nameTranslit: {
        type: String,
        default: '',
        trim: true
    },
    routeLength: {
        type: Number,
        default: 0,
    },
    difficult: {
        type: String,
        default: '',
        required: [true, '-Укажите сложность маршрута']
    },
    duration: {
        type: Number,
        default: 0,
        required: [true, '-Укажите длительность маршрута']
    },
    type: {
        type: String,
        default: '',
        required: [true, '-Укажите тип маршрута']
    },
    bikeType: {
        type: String,
        default: '',
        required: [true, '-Укажите тип мотоцикла']
    
    },
    description: {
        type: String,
        default: '',
        required: [true, '-Напишите описание маршрута']

    },
    points: {
        type: [Point],
        default: [],
        required: [true, '-В маршруте должны быть путевые точки'],
        validate:{
            validator: v => Array.isArray(v) && v.length > 0,
            message: '-В маршруте должны быть путевые точки'
        }
    },
    routeGeoJson: {
        type: Object,
        default: {}
        
    },
    routeFiles: {
        type: Array,
        default: [],
    },
    routeImages:{
        type: Array,
        default: [],
        validate:{
            validator: v => Array.isArray(v) && v.length > 0,
            message: '-В маршруте должна быть хотя бы одно изображение и выбран аватар'
        }
    },
    avatar: {
        type: Object,
        get: v => v,
        set: v => {if (v == null) {return defaultImage} else {return v}},
        default: defaultImage,
    },
    meta: {
        votes: Number,
        
    },
    author: {
        name: String,
        email: String,
        id: String
    },
    comments:[{
        body: String,
        author: String,
        date: Date
    }],
    date: Date,
    isDraft: {
        type: Boolean

    }

})

// routemodel.pre('deleteOne', function(next){
//     console.log('middleWere!!!!!!!')
//     const dirName = this._id
//     const dirPath = `./public/routes/${dirName}`        
//     if (!fs.existsSync(dirPath)){
//         console.log(this)
//         rimRaf.sync(dirPath)}
//     next()
// })

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
routemodel.methods.mkRouteDirectory = function(){
    if (!this._id) return false
    const dirName = this._id
    const dirPath = `./public/routes/${dirName}`        
    if (!fs.existsSync(dirPath)){fs.mkdirSync(dirPath)}
    const routeDirPath = `./public/routes/${dirName}/routefiles` 
    if (!fs.existsSync(routeDirPath)){ fs.mkdirSync(routeDirPath)}
    const routeImageDirPath = `./public/routes/${dirName}/routeimages`
    if (!fs.existsSync(routeImageDirPath)){ fs.mkdirSync(routeImageDirPath)}
    const pointImagesDirPath = `./public/routes/${dirName}/pointimages`
    if (!fs.existsSync(pointImagesDirPath)){ fs.mkdirSync(pointImagesDirPath)}
    if (fs.existsSync(dirPath) && 
    fs.existsSync(routeDirPath) && 
    fs.existsSync(routeImageDirPath) &&
    fs.existsSync(pointImagesDirPath)){ return true}
}
routemodel.methods.deleteRouteDir = function(){
    console.log('middleWere!!!!!!!',this._id)
    const dirName = this._id
    const dirPath = `./public/routes/${dirName}`        
    if (fs.existsSync(dirPath)){
        console.log(this._id)
        rimRaf.sync(dirPath)
    }
    if (!fs.existsSync(dirPath)){
        return true
    }
}
routemodel.methods.deleteFile = function(file){
    if (fs.existsSync(file.path)){
        fs.rm(file.path, function(err){
            if (err) {
                console.log(err)
                return false}
                
        })        
    }
    this.routeImages = this.routeImages.filter(image => image.path != file.path) 
    return true

}
routemodel.methods.deletePointImage = function(file){
     if (fs.existsSync(file.path)){
        fs.rm(file.path, (err) => {
            if (err) {
                console.log(err)
                return false}
            return true      
                               
        })
    }
   
    
}
routemodel.methods.uploadFiles = function(files, pointId=null){
    let filePaths = []
    for (let file in files){        
        switch(file){
            case 'routeImages' :
                const routeImages = files[file]
                let dirPath = path.normalize(`public/routes/${this._id}/routeimages/`)
                for (let image of routeImages){
                    let filePath = dirPath + Date.now() + '.jpg'
                    console.log(filePath)
                    fs.writeFileSync('./' + filePath, image.buffer)
                    image.path = filePath
                    image.isAvatar = false
                    delete image.buffer
                    filePaths.push(image)
                    }
                    this.routeImages = this.routeImages.concat(filePaths)
                break
            case 'pointImages' :
                const pointImages = files[file]
                let dirPath2 = path.normalize(`public/routes/${this._id}/pointimages/`)
                console.log(files[file])
                for (let image of pointImages) {
                    console.log(files)
                    let pointDir = path.normalize(dirPath2 + pointId + '/')
                    if (!fs.existsSync(pointDir)){
                        fs.mkdirSync(pointDir)
                    }
                    let filePath = pointDir + Date.now() + '.jpg'
                    fs.writeFileSync('./' + filePath, image.buffer)
                    image.path = filePath                    
                    delete image.buffer
                    filePaths.push(image)                    
                }
                return filePaths
                break
        }
    }
    console.log(filePaths)
    
}


const RouteModel = mongoose.model('RouteModel', routemodel);
module.exports = RouteModel