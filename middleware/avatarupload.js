const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        
        const destPath = `./public/users/${req.body.id}` 
        if (!fs.existsSync(destPath)){
            fs.mkdirSync(destPath)
        }
        cb(null, destPath)
    },
    filename: function(req, file, cb){
       // console.log(req.body, file)
        cb(null, 'avatar.jpg')
    }
})

const upload = multer({storage})

const avatarUpload = upload.fields([{name: 'avaFile', maxCount: 1}])

module.exports = avatarUpload