const express = require('express')
const app = express()
const user = require('./routes/user')
const cors = require('cors')
require('./db/db')

const port = 3000
app.use(express.json())

app.use(cors())
app.use('/user', user)



app.listen(port,()=>{
    console.log(`Mroute api run on http://localhost:${port}`)
})