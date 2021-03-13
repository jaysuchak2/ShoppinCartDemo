const mailer = require("nodemailer");

module.exports = () =>
  mailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
   // ignoreTLS: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    },
    // tls: {
    //   // do not fail on invalid certs
    //   rejectUnauthorized: false
    // }
  });
