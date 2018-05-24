const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testmailforlott@gmail.com',
    pass: 'kjnthtzntcn'
  }
});

function sendUserMail(addres, text) {
    const mailOptions = {
        from: 'testmailforlott@gmail.com',
        to: addres,
        subject: 'Lottery test mail',
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendMail: sendUserMail
}