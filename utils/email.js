const nodemailer = require("nodemailer");
const pug = require("pug");
// const htmlToText = require('html-to-text');
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    //the url is ooming from the authcontroller
    this.url = url;
    this.from = `PRUTHVIJ DESAI <${process.env.GMAIL_ADDRESS}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Send the actual email
  async send(template, subject, booking, user) {
    console.log("First Name:", this.firstName); // Log the firstName
    const html = pug.renderFile(
      `${__dirname}/../emails/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        booking,
        user,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendBookingReceipt(booking) {
    await this.send("receipt", "Booking Receipt", booking);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Cropify Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
