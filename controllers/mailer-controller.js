import nodemailer from "nodemailer";
import { google } from "googleapis";


function credential_setter(){
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  return oAuth2Client;
}

async function sendMail(email, subject, text, html) {
  const oAuth2Client=credential_setter();
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

export default sendMail;
