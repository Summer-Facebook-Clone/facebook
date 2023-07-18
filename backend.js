import app from "./server.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs";
import { fileURLToPath } from "url";
import { User } from "./modules/user.js";
import { Post } from "./modules/post.js";
import { authenticate } from "./server.js";
import { user_finder } from "./passport-config.js";

let url_token=null;
// Number of salt rounds for bcrypt hashing
const salt_rounds = 10;

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Home route
app.get("/", check_authentication, (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Profile route
app.get("/home", check_authentication, (req, res) => {
  res.sendFile(__dirname + "/profile.html");
  // instagram_media_fetcher(
  //   req.user,
  //   "https://graph.instagram.com/me/media?fields=id,caption,media_url&access_token=IGQVJXVTFpMTc2VlhKekVydDN1dmwzZAHVLZAkNsQTNtazAxV1NMRE45RGZAZAeVBFVC1wdEx6ZA0RLQ1Fvd21KTnQySmZAXX1JSOFhiQWlaOUtDX3RKcVJxMmZAoVTBuV3VFbEtHenhkRWRaM1lQWm9FTlZArdAZDZD"
  // );
});

// Sign up route
app.get("/sign-up", not_authenticated, (req, res) => {
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
app.get("/sign-in", not_authenticated, (req, res) => {
  res.render("pages/signin.ejs");
  // res.sendFile(__dirname + "/signin.html");
});

// Handle sign-in form submission
app.post("/sign-in", authenticate);

app.delete("/sign-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/home");
  });
});

// forgor password route
app.get("/forgot-password", not_authenticated,(req, res) => {
  res.render("pages/resetpassword.ejs");
});

// Handle forgot password form submission
app.post("/forgot-password",  async (req, res) => {
  const username = req.body.username;
  const found_user = await user_finder(username);
  if(found_user !==null){
    const secret=process.env.JWT_SECRET+found_user.password;
    const payload={
      email:found_user.email,
      id:found_user._id
    }
    const token=jwt.sign(payload,secret,{expiresIn:"15m"});
    const link = `http://localhost:3000/reset-password/${found_user._id}/${token}`;
    console.log(link);
    res.send("Password reset link has been sent to your email address");
  }
  else{
    res.send("User not found");
  }
});

// reset password route
app.get("/reset-password/:id/:token",not_authenticated,async (req,res)=>{
  const {id,token}=req.params;
  if (token !== 'null') {
    url_token=token;
  }
  const found_user=await User.findById(id)
  if (found_user == null) {
    res.send("Invalid ID");
  }
  const secret= process.env.JWT_SECRET+found_user.password;
  try{
    const payload=jwt.verify(url_token,secret);
    res.render("pages/newpassword.ejs",{email:found_user.email});
  }catch(error){
    console.log(error.message);
    res.send("Invalid token");
  }
});

// Handle reset password form submission
app.post("/reset-password/:id/:token",async (req,res)=>{
  const {id,token}=req.params;
  if (token !== 'null') {
    url_token=token;
  }
  const {password,confirm_password} = req.body;
  const found_user=await User.findById(id)
  if (found_user == null) {
    res.send("Invalid ID");
  }
  const secret= process.env.JWT_SECRET+found_user.password;
  try{
    const payload=jwt.verify(url_token,secret);
    const hashed_password=await password_hasher(password);
    found_user.password=hashed_password;
    await found_user.save();
    res.redirect("/sign-in");
  }catch(error){
    console.log(error.message);
    res.send("Invalid token");
  }
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
 * Creates a new post for the current user based on the image url that is fetched using Instagram basic display API.
 * @param {User} user - The user that is currently logged in.
 * @param {string} image_url - The URL of the image to be posted.
 * @param {string} caption - The caption of the post.
 */
async function post_creator_from_instagram(user, image_url, caption) {
  const post = await Post.create({
    caption: caption,
    image_url: image_url,
    user: user._id,
  });
  user.posts.push(post._id);
  await user.save();
}

/**
 * Fetches user's media from the Instagram API and saves it to the current user's document in the database.
 * @param {string} url - The URL of the Instagram API endpoint to fetch the media from.
 * @param {User} current_user - The user that is currently logged in.
 * @returns {void}
 */
async function instagram_media_fetcher(current_user, url) {
  try {
    let response = await axios.get(url);

    while (true) {
      for (let i = 0; i < response.data.data.length; i++) {
        await post_creator_from_instagram(
          current_user,
          response.data.data[i].media_url,
          response.data.data[i].caption
        );
      }

      if (response.data.paging.next) {
        response = await axios.get(response.data.paging.next);
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Checks if the user is authenticated.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {void}
 */
function check_authentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/sign-in");
}

/**
 * Checks if the user is not authenticated.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {void}
 */
function not_authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  next();
}

/* Commented functions that can be useful later in the program */

// /**
//  * Fetches an image from a URL and saves it to the "images" directory.
//  * @param {string} url - The URL of the image to fetch.
//  * @param {number} num - The number of the image to save.
//  * @returns {void}
//  */
// function image_creator(url, num) {
//   axios
//     .get(url, { responseType: "stream" })
//     .then((response) => {
//       response.data.pipe(fs.createWriteStream(`images/${num}ada_lovelace.jpg`));
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }
