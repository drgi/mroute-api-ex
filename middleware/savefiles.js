const fs = require('fs')
const path = require('path')

function pushImageInPoint(routeDoc, id, filePaths) {
   
    return routeDoc
}

async function saveFile(req, res, next) {
    //console.log('SaveFile',req.route)
    const files = req.files
    for (let file in files){
        
        switch(file){
            case 'routeImages' :
                const routeImages = files[file]
                let dirPath = path.normalize(`public/routes/${req.route._id}/routeimages/`)
                for (let image of routeImages){
                    let filePath = dirPath + Date.now() + '.jpg'
                    console.log(filePath)
                    fs.writeFileSync('./' + filePath, image.buffer)
                    image.path = filePath
                    delete image.buffer
                    console.log(req.route.routeImages, image)
                    req.route.routeImages.push(image)
                }
                break
            case 'pointImages' :
                const pointImages = files[file]
                let dirPath2 = path.normalize(`public/routes/${req.route._id}/pointimages/`)
                console.log(files[file])
                for (let image of pointImages) {
                    let pointDir = path.normalize(dirPath2 + image.originalname + '/')
                    if (!fs.existsSync(pointDir)){
                        fs.mkdirSync(pointDir)
                    }
                    let filePath = pointDir + Date.now() + '.jpg'
                    fs.writeFileSync('./' + filePath, image.buffer)
                    image.path = filePath                    
                    delete image.buffer
                    console.log(image)                    
                    req.route.points = req.route.points.map(point => {        
                        if (point.id === image.originalname){
                            console.log(point.id)
                            point.images.push(image)
                        }
                        return point
                    })
                    
                }
        }
    }
    
    //req.route = await req.route.save()
    //fs.writeFileSync('./public/test.jpg', req.files.routeImages[0].buffer)
    next()
}
module.exports = saveFile