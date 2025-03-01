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
    this.adminEmail = 'pdhome008@gmail.com';
  }

  generateVerificationCode() {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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
  async send(template, subject, data = {}) {
    try {
      console.log("First Name:", this.firstName);
      const html = pug.renderFile(
        `${__dirname}/../emails/email/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...data
        }
      );

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html)
      };

      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully to:', this.to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send email to admin
  async sendToAdmin(template, subject, data = {}) {
    try {
      const originalTo = this.to;
      this.to = this.adminEmail;
      await this.send(template, subject, data);
      this.to = originalTo;
      console.log('Admin notification sent successfully');
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw new Error(`Failed to send admin notification: ${error.message}`);
    }
  }

  async sendBookingReceipt(booking) {
    try {
      // Send receipt to customer
      await this.send("receipt", "Booking Receipt", { booking });
      
      // Send verification code to customer
      await this.send("verification", "Your Order Verification Code", {
        booking,
        verificationCode: booking.verificationCode
      });

      // Send notification to admin with verification code
      await this.sendToAdmin("adminNotification", "New Order Received", {
        booking,
        customerName: this.firstName,
        customerEmail: this.to,
        verificationCode: booking.verificationCode
      });

    } catch (error) {
      console.error('Error in sendBookingReceipt:', error);
      throw new Error(`Failed to process booking receipt: ${error.message}`);
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Cropify!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
