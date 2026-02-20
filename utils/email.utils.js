const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transproter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
       }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.message
    };  
    await transproter.sendMail(mailOptions);
};

module.exports = sendEmail;