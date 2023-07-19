import nodemailer from "nodemailer";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})

async function sendMail(email,subject,text,html) {
    html = html || `<p>${text}</p>}`
  try{
    const accessToken=await oAuth2Client.getAccessToken()
    const transport=nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'amirrezamojtahedi2@gmail.com',
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken:process.env.REFRESH_TOKEN,
        accessToken:accessToken
      }
    })
    const mailOptions={
      from:'"Amirreza Mojtahedi" <amirrezamojtahedi2@gmail.com>',
      to: email,
      subject: subject,
      text: text,
      html: html
    }
    const result=await transport.sendMail(mailOptions)
    return result
  }catch(error){
    return error
  }
}

export default sendMail