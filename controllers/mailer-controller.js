import nodemailer from "nodemailer";
import { google } from "googleapis";
import { UserOTPVerification } from "../modules/userOTPVerification.js";
import { password_hasher } from "./auth-controller.js";

/**
 * Creates a new OAuth2Client, and go through the OAuth2 content. This function is internal to this file.
 * @returns {oAuth2Client} A new OAuth2Client object with the credentials set.
 */
function credential_setter() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  return oAuth2Client;
}

/**
 * Sends an email to the user.
 * @param {string} email - The email address of the user.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The text of the email.
 * @param {string} html - The HTML of the email.
 * @returns {Promise} A promise that resolves with the result of the email sending, or rejects with an error.
 */
async function sendMail(email, subject, text, html) {
  const oAuth2Client = credential_setter();
  html = html || `<p>${text}</p>}`;
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "amirrezamojtahedi2@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: '"Amirreza Mojtahedi" <amirrezamojtahedi2@gmail.com>',
      to: email,
      subject: subject,
      text: text,
      html: html,
    };
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Sends an OTP verification email to the user.
 * @param {string} _id - The user's ID.
 * @param {string} email - The user's email address.
 * @returns {void}
 */
async function send_OTP_verification_email(_id, email) {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    password_hasher(otp).then(async (hashed_otp) => {
      const userOTPVerification = new UserOTPVerification({
        userID: _id,
        otp: hashed_otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
      await userOTPVerification.save();
      sendMail(
        email,
        "OTP Verification",
        `Your OTP is ${otp}`,
        `<div style='text-align: center; width: 500px; border: 1px solid lightgray; padding: 10px;'>
        <img src="" alt="'logo">
        <h1>OTP Verification</h1>
        <p>Thanks for signing up! To start exploring our app, verify your account with the following OTP:</p>
        <p style='display: inline-block; background-color: black; color: white; padding: 10px 20px; width: max-content; margin: 0px;'>${otp}</p>
        <p>This password expires in one hour!</p>
    </div>`
      );
    });
  } catch (error) {
    console.error(error.message);
  }
}

export default sendMail;
export { send_OTP_verification_email };
