// Import the required modules
import express from "express";
import bodyParser from "body-parser";
import connectDB from "./database.js";
import flash from "express-flash";
import session from "express-session";
import method_override from "method-override";
import dotenv from "dotenv";
import passport from "passport";
import initialize from "./passport-config.js";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID='471570619630-94heuqilmc6r9cfckc9dffq39phsd9tj.apps.googleusercontent.com'
const CLIENT_SECRET='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'
const REDIRECT_URI='https://developers.google.com/oauthplayground'
const REFRESH_TOKEN='1//04116vGGSTXPkCgYIARAAGAQSNwF-L9IrZ0yEwdupwSQfkjTNvoXbuVPUm8EDZzBO6OBQMkZhtgtXQkS2By2BMqMJqre5zVAQ0eY'
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})

async function sendMail() {
  try{
    const accessToken=await oAuth2Client.getAccessToken()
    const transport=nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'amirrezamojtahedi2@gmail.com',
        clientId:CLIENT_ID,
        clientSecret:CLIENT_SECRET,
        refreshToken:REFRESH_TOKEN,
        accessToken:accessToken
      }
    })
    const mailOptions={
      from:'"Amirreza Mojtahedi" <amirrezamojtahedi2@gmail.com>',
      to:'amirrezamojtahedi2@gmail.com',
      subject:'Hello from gmail using API',
      text:'Hello from gmail email using API',
      html:'<h1>Hello from <b>gmail email</b> using API</h1>'
    }
    const result=await transport.sendMail(mailOptions)
    return result
  }catch(error){
    return error
  }
}

// Load environment variables from .env file
dotenv.config();

// Initialize passport
initialize(passport);

// Create an Express app
const app = express();

// Connect to MongoDB Atlas and start the server
await connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server started");
  });
});

// set the view engine to ejs
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static("public"));

// flash middleware
app.use(flash());

// session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});

// Use the session middleware for managing user sessions
app.use(sessionMiddleware);

// Initialize Passport middleware for authentication
app.use(passport.initialize());

// Use Passport session middleware for persistent login sessions
app.use(passport.session());

// Use method override middleware for HTTP method override
app.use(method_override("_method"));

// Parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// passport.authenticate middleware is used to authenticate the user based on the provided credentials.
// It expects the username and password to be included in the request body.
// The local strategy is configured in passport-config.js using passport.use(new localStrategy(...)),
// which specifies how the strategy should extract and verify the username and password from the request.
// By default, the local strategy automatically fetches the username and password fields from the request body.
// If you want to fetch additional fields, you can specify them in the options object of the localStrategy constructor.
const authenticate = passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/sign-in",
  failureFlash: true,
});

sendMail().then((result)=>{
  console.log('Email sent...',result)
  }).catch((error)=>{
  console.log(error.message)
})

// export the app object and the authenticate function.
export default app;
export { authenticate };
