const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


async function sendMail(to,subject,content){
    
    try{

        const info = await transporter.sendMail({
            from:process.env.EMAIL_NAME,
            to:to,
            subject:subject,
            text:content
        })

        console.log("email sent: ",info.response)
    }catch(error){
        console.log("error::",error.message);
    }
}

sendMail("swingvotter@gmail.com","test123","this is for testing")

module.exports = sendMail
