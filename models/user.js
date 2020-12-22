const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { request } = require('express')

const JWT_KEY = 'HuiVamVsem2020'


const userScheme = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value=>{
            if(!validator.isEmail(value)){
                throw new Error({error: `Email is invalid ${value}`})
            }
        }
        
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    avatar:{
        type: String
    },
    tokens: [{
    token:{
        type: String,
        required: true
    }

    }]

})
userScheme.pre('save', function(next){
   const user = this
   bcrypt.genSalt(10,(err, salt)=>{
       bcrypt.hash(user.password, salt, (err, hash)=>{
           user.password = hash
       } )
   })
    next()

})
userScheme.statics.FindUserForAuth = async (requestFromUser)=>{
    console.log('Функ работает',requestFromUser)
    const user = await UserModel.findOne({email: requestFromUser.email})
    //console.log('Найден ', user)
    if (!user){
        console.log(!user)
        throw new Error(`Пользователь с таким Email не сущуствует`)
    }
    
    let isPaswordValid = bcrypt.compareSync(requestFromUser.password, user.password)
    if(!isPaswordValid){
        throw new Error(`Не верный пароль`)
    }
    return user
    
}
userScheme.methods.GenerateToken = async function(){
    //Generete new token
    const user = this;
    
    const token = jwt.sign({_id: user._id}, JWT_KEY)

    user.tokens = user.tokens.concat({token})
    console.log(token)
    await user.save()
    return token

}

const UserModel = mongoose.model('UserModel', userScheme)
module.exports = UserModel