const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        console.log(req.user)
        const path = `./uploads/${req.user.name}_id`;
        fs.mkdirSync(path, {recursive:true})
        cb(null, path)
    },
    filename: (req, file, cb)=>{
        const filename = `${req.user.name}.jpg`
        
        cb(null, filename )
    }
   

})


const upload = multer({storage: storage});


module.exports = upload