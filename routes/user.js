const express = require('express');
const upload = require('../middleware/fileupload')

const router = express.Router();
const UserModel = require('../models/user')
const auth = require('../middleware/auth');






// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  
 // console.log(req.body)
 next();
});

// GET wats user?
router.get('/me', auth, async function(req, res) {
  try{
   console.log(req.user.avatar)
    // res
    // .send(JSON.stringify({user: req.user, message: 'Вы авторизироавнны',token: req.token}))
    // .sendFile(req.user.avatar)
    res.download(`./${req.user.avatar}`)

  } catch(error){
    res.status(401).send({error:error.message})
  }
  
});

//User profile change
router.put('/me', auth, async (req, res)=>{

})

///FIle Upload(avatar img)
router.post('/me',auth, upload.any(),async (req, res)=>{
  
  console.log(req.files)
  req.user.avatar = req.files[0].path
  await req.user.save()

})

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
    res.status(401).send(JSON.stringify({message: 'Вы вышли из системы!'}))
  } catch(err){
    res.status(500).send(JSON.stringify(err))
  }
})




module.exports = router;