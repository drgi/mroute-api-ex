const mongoosee = require('mongoose')
const MONGO_URL = 'mongodb+srv://mroute:3946646@mroute.ae14d.mongodb.net/mroute?retryWrites=true&w=majority'

mongoosee.connect(MONGO_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch(e=>{
    console.log(e)
})
