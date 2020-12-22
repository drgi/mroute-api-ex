const multer = require('multer')
const fs = require('fs')


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {

//     },
//     filename: (req, file, cb) => {

//     }
//  })
const storage = multer.memoryStorage()
const upLoad = multer(storage)
const editRouteUpload = upLoad.fields([{name: 'routeFiles', maxCount: 5}, {name: 'routeImages', maxCount: 10}, {name: 'pointImages', maxCount: 50}])

module.exports = editRouteUpload