const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
require('dotenv').config()

const transportConfig = {
    host: process.env.SMTP,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
}
const handlebarsOptions = {
    viewEngine:{
        extname: 'handlebars',
        layoutsDir: './utils/mailer/tamplates',
        partialsDir: './utils/mailer/tamplates',
        defaultLayout: 'template'
    },
    viewPath: './utils/mailer/tamplates',        
    extName: '.html'
}

const transporter = nodemailer.createTransport(transportConfig)

transporter.use('compile', hbs(handlebarsOptions))
transporter.verify(function(err, success) {
    if (err) {
        console.log('SMTP Error: ',err)
    } else {
        console.log('SMTP is Ready')
    }
})
module.exports = transporter
