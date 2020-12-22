const express = require('express');
const avatarUpload = require('../middleware/avatarupload')

const router = express.Router();
const UserModel = require('../models/user')
const RouteModel = require('../models/route')
const auth = require('../middleware/auth');






// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  
 // console.log(req.body)
 next();
});

// GET wats user?
router.get('/me', auth, async function(req, res) {
console.log(req.user)
const user = {
  
}
res.status(200).json({message: 'good'})
  
});

//User profile change
router.patch('/me', auth, avatarUpload, async (req, res)=>{
 if (req.files.avaFile){
  req.body.avatar = req.files.avaFile[0].path
 }
 console.log('body:',req.user)
 try {
   const user = await UserModel.findByIdAndUpdate(req.user.id, {...req.body} ,{new: true, lean: true}).select('-password -tokens')
   console.log(user)
   user.token = req.token
   res.status(200).json(user)
 } catch(e){console.log(e)}
})

///FIle Upload(avatar img)
// router.post('/me',auth, upload.array('files', 5),async (req, res)=>{
//   console.log(req.body)
//   console.log(req.files)
//   req.user.avatar = req.files[0].path
//   await req.user.save()

// })

// POST login route
router.post('/login',async (req, res)=> {
  try {
    console.log(`Запрос:${req.body}`)
 const user = await UserModel.FindUserForAuth({...req.body})
 console.log(user)
 if(!user){
     res.status(401).send(JSON.stringify({error: 'Ошибка Авторизации'}))
 }
 const token = await user.GenerateToken()
 res.status(200).send(JSON.stringify({user, token}))

} catch(error){
    console.log(error)
    res.status(400).send(JSON.stringify({error:error.message}))
}
});
///POST Singup
router.post('/singup',async (req, res)=>{
    try{
    console.log(req.body)
    const user = new UserModel(req.body)
    await user.save()
    const token = await user.GenerateToken()
    res.status(201).send(JSON.stringify({user, token, message:'Вы успешно зарегестрированны!'}))
    } catch(error){
       
       if(error.driver){
        res.status(208).send(JSON.stringify({error: `Этот Email уже зарегистрирован`}))
       }
      //  if(error.message){
      //   res.status(208).send(JSON.stringify({error: `Введите верный Email`}))
      //  }
    }

    
    
})
///Post logout
router.post('/logout', auth, async (req, res)=>{
  try{
    req.user.tokens = req.user.tokens.filter(token=>token != req.token)
    await req.user.save()
    res.status(401).send(JSON.stringify({message: 'Вы вышли из системы!'}))
  } catch(err){
    res.status(500).send(JSON.stringify(err))
  }
})
///Get logout all device
router.get('/logoutall', auth, async (req, res)=>{
  try{
    req.user.tokens.splice(0,req.user.tokens.length)
    await req.user.save()
    res.status(200).send(JSON.stringify({message: 'Вы вышли из системы!'}))
  } catch(err){
    res.status(500).send(JSON.stringify(err))
  }
})
//Get UserRoutes
router.get('/myroutes', auth, async (req, res) => {
  //console.log('User',req.user)
  const routeIds = req.user.myRoutes.map(route => route.routeId)
  try {
    const docs = await RouteModel.find({_id: routeIds}).lean().select('nameTranslit name description avatar')
    console.log(docs)
    if (docs.length > 0){
      res.status(200).json(docs)
    } else {
      res.status(200).json([])
    }

  }catch(e){console.log(e)}
 
})



module.exports = router;