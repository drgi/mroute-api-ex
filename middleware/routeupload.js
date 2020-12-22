const multer = require('multer')
const fs = require('fs')
const { transliterate, slugify} = require('transliteration');


const storage = multer.diskStorage({
    destination: function(req, file, cb){
       console.log('multer start', file)
        //let trName = transliterate(req.body.title)
        req.body.nameTranslit = slugify(req.body.name, {separator: '-'})
        console.log(`file: ${file.fieldname}`)
        let destPath = `./public/routes/${req.body.nameTranslit}`        
        if (!fs.existsSync(destPath)){
           fs.mkdirSync(destPath) 
        }
        destPath += `/${file.fieldname}`
        if (!fs.existsSync(destPath)){
            fs.mkdirSync(destPath) 
         }
        if (file.fieldname == 'pointImages') {
            destPath += `/${file.originalname}`
            if (!fs.existsSync(destPath)){
                fs.mkdirSync(destPath)
            }
             
        } 
        console.log(destPath)
        cb(null, destPath)
    },
    filename: function(req, file, cb){
        console.log(file)
        let fileName = ''
        if (file.fieldname == 'pointImages') {
            fileName = Date.now() + '.jpg'
                       
        } else {
        fileName = Date.now() + /\.[a-z]*$/gi.exec(file.originalname)[0].toLowerCase()
        }
        console.log('filename', fileName)

        cb(null, fileName)

    }
})

const upLoad = multer({storage})

const routeUpload = upLoad.fields([{name: 'routeFiles', maxCount: 5}, {name: 'routeImages', maxCount: 10}, {name: 'pointImages', maxCount: 50}])

module.exports = routeUpload


