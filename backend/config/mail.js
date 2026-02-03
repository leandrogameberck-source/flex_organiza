require('dotenv').config();

module.exports = {
  smtp: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: process.env.IMAP_PORT,
    tls: process.env.IMAP_TLS === 'true',
    tlsOptions: { rejectUnauthorized: false }
  },
  from: process.env.MAIL_FROM,
  whatsapp: process.env.WHATSAPP_NUMBER || '551997782527'
};
