require("dotenv").config();
const { NODE_EMAIL_ID, NODE_PASS = "SKU6 n8J0 6X3T" } = process.env;
const nodemailer = require("nodemailer");

const sendSelfMail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODE_EMAIL_ID,
        pass: NODE_PASS,
      },
    });

    const mailOptions = {
      from: data.from,
      to: "hello@buzinessconnect.com",
      subject: data.subject,
      text: data.text,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("🚀 ~ sendSelfMail ~ error:", error);
      } else {
        console.log("🚀 ~ Email sent: ~ response: " + info.response);
      }
    });
  } catch (error) {
    console.log("🚀 ~ sendSelfMail ~ error:", error);
  }
};

module.exports = sendSelfMail;
