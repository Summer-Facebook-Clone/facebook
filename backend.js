// Import the required modules
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import axios from "axios";
import fs from "fs";
import { fileURLToPath } from "url";
import { User } from "./modules/user.js";

dotenv.config();

// MongoDB Atlas connection URI
const uri = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@instagram-clone.gxdemf6.mongodb.net/Instagram-db?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas and start the server
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to MongoDB Atlas");
    app.listen(3000, () => {
      console.log("Server started");
    });
  })
  .catch((err) => console.error(err));

// Number of salt rounds for bcrypt hashing
const salt_rounds = 10;

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Create an Express app
const app = express();

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

function image_fetcher(url,num){
  axios.get(url,{ responseType: 'stream' })
  .then((response) => {
    response.data.pipe(fs.createWriteStream(`images/${num}ada_lovelace.jpg`))
  })
  .catch((error) => {
    console.log(error);
  });
}

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
  axios.get("https://graph.instagram.com/me/media?fields=id,caption,media_url&access_token=IGQVJWNHJWLVVJRVpua2NFU3ctaVhkVEpMQWhIemFVZAUl4eWVGczdYcDRVZADZA4NG5OcUcxc29aR0c4bGpPU3cyamh6aWNmNVpjZAk5HdnZA0czNlUWs5YmRWeS1QWk90S1Q3N1dCZAS16b3Uzekd5ZADVGbAZDZD")
  .then((response) => {
    response.data.data.forEach((element,index) => {
      image_fetcher(element.media_url,index);
    });
  })
  .catch((error) => {
    console.log(error);
  }); 
});

// Sign up route
app.get("/sign-up", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// Handle sign-up form submission
app.post("/sign-up", (req, res) => {
  password_hasher(req.body.password).then((hash) => {
    user_creator(req.body.email, req.body.full_name, req.body.username, hash);
    res.redirect("/sign-in");
  });
});

// Sign in route
app.get("/sign-in", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

// Handle sign-in form submission
app.post("/sign-in", (req, res) => {
  user_finder(req.body.username).then((user) => {
    validate_user(req.body.password, user.password)
      .then((result) => {
        if (result) {
          res.redirect("/home");
        }
      })
      .catch((err) => console.error(err.message));
  });
});

// Home route after successful sign-in
app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/profile.html");
});

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} A promise that resolves with the hashed password, or logs an error message if an error occurs.
 */
async function password_hasher(password) {
  try {
    return await bcrypt.hash(password, salt_rounds);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Adds a new user to the database.
 * @param {string} email - The email of the user.
 * @param {string} full_name - The full name of the user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {void}
 */
function user_creator(email, full_name, username, password) {
  const user = new User({
    username: username,
    password: password,
    email: email,
    full_name: full_name,
  });
  user.save().catch((err) => console.error(err));
}

/**
 * Retrieves a user from the database based on the username.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<User>} A promise that resolves with the retrieved user, or rejects with an error.
 */
function user_finder(username) {
  return new Promise((resolve, reject) => {
    User.findOne({ username: username })
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Validates a password by comparing it with a hash using bcrypt.
 * @param {string} password - The password to validate.
 * @param {string} hash - The hash to compare the password with.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the password is valid or not, or rejects with an error.
 */
async function validate_user(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error(err.message);
    return false;
  }
}


// Steps to get the instagram images from their API (For now, you must have a Facebook Developer account):
// 1. Get the access token from the Instagram Developer Console (Generate Token).
// 2. https://graph.instagram.com/me/media?fields=id,caption,media_url&access_token={access_token}
// 3. This returns a JSON object with two keys : 1-data 2-paging. data is an array of objects and each object is a post.
//  3.1. Each object has 3 keys : 1-id 2-caption 3-media_url
//  3.2. The media_url is the URL of the post.
//  3.3. The caption is the caption of the post.
//  3.4. The id is the id of the post.
// 4. We can use the media_url to display the image on our website.
// 5. data array always holds 25 posts or less. To get the next 25 posts, we use the paging key.
//  5.1. The paging key holds an object and that object has 3 keys : 1-cursors 2-next(if not at the end) 3-previous(if not in the beinging)
//  5.2. next and previous are URLs that we can use to get the next or previous 25 posts.

// Finds all the users in the database and sends them back to the client.
// User.find() is a promise. If it is successful, we send the result back to the client (which is all the users).
// app.get("/all-users", (req, res) => {
//   User.find()
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((err) => console.error(err));
// });
