const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
require('dotenv').config();

const transportConfig = {
  host: process.env.SMTP,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

const handlebarsOptions = {
  viewEngine: {
    extname: 'handlebars',
    layoutsDir: './components/user/mailer/tamplates',
    partialsDir: './components/user/mailer/tamplates',
    defaultLayout: 'template',
  },
  viewPath: './components/user/mailer/tamplates',
  extName: '.html',
};

const transporter = nodemailer.createTransport(transportConfig);

transporter.use('compile', hbs(handlebarsOptions));

module.exports = transporter;
