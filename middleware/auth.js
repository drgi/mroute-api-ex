const User = require('../models/user')
const jwt = require('jsonwebtoken')
const JWT_KEY = 'HuiVamVsem2020'

const auth = async (req, res, next)=>{
    const token = req.header('Authorization').replace('Bearer ', '')
    //console.log(token)
    const decoded = jwt.verify(token, JWT_KEY,(err, decoded)=>{
        if(err){

           res.status(401).send({error:'Invalid Token'})
        }
        return decoded
    });
    
    console.log(decoded)
    try{
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
    if(!user){
        throw new Error('Поьзователь не найден')
    }
    req.user = user
    req.token = token
    next()
    }catch(e){
        res.status(401).send({error: error.message})
    }

}


module.exports = auth