const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        console.log('multer say', file)
        const path = `./uploads/${req.user.name}_${req.user._id}`;
        fs.mkdirSync(path, {recursive:true})
        cb(null, path)
    },
    filename: (req, file, cb)=>{
        const filename = `${Date.now()}.jpg`
        
        cb(null, filename )
    } 

})
const fileFilter = function(req, file, cb) {
    console.log(file)
    cb(null, true)
}
const upload = multer({storage: storage});


module.exports = upload