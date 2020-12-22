const express = require('express')
const app = express()

////Routes 
const user = require('./routes/user')
const route = require('./routes/route')
//Static file
const static = express.static(__dirname + '/public')


const cors = require('cors')
require('./db/db')

const port = 3000

app.use('/public', static)

app.use(express.json())

app.use(cors())

app.use('/user', user)
app.use('/route', route)



app.listen(port,()=>{
    console.log(`Mroute api run on http://localhost:${port}`)
})