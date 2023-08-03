import express from "express";
import { User } from "../modules/user.js";
import { user_finder } from "../controllers/db-crud-controller.js";
import {
  not_authenticated,
  password_hasher,
} from "../controllers/auth-controller.js";
import { generate_password_reset_link } from "../controllers/auth-controller.js";
import sendMail from "../controllers/mailer-controller.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// url_token is used to store the token that is sent to the user's email when they request to reset their password
let url_token = null;

// forgot password route
router.get("/forgot-password", not_authenticated, (req, res) => {
  res.render("pages/resetpassword.ejs");
});

// Handle forgot password form submission
router.post("/forgot-password", async (req, res) => {
  const username = req.body.username;
  const found_user = await user_finder(username);
  if (found_user !== null) {
    const link = generate_password_reset_link(found_user);
    sendMail(
      found_user.email,
      "Reset password request",
      link,
      `<div style='text-align: center; width: 500px; border: 1px solid lightgray; padding: 10px;'>
    <img src="" alt="'logo">
    <h1>Password Reset</h1>
    <div>
        <p>Hi ${found_user.full_name}, did you requested a password reset?</p>
        <p>Click on this link to create a new password:</p>
        <a href=${link} style='background-color: black; display: inline-block; text-decoration: none; color: white; padding: 20px 40px; border-radius: 10px;'>
            Set a new password
        </a>
        <p>If you didn't request a password reset, you can ignore this email.</p>
    </div>
</div>`
    ).catch((error) => {
      console.log(error.message);
    });
    res.send("Password reset link has been sent to your email address");
  } else {
    res.send("User not found");
  }
});

// reset password route
router.get(
  "/reset-password/:id/:token",
  not_authenticated,
  async (req, res) => {
    const { id, token } = req.params;
    if (token !== "null") {
      url_token = token;
    }
    const found_user = await User.findById(id);
    if (found_user == null) {
      res.send("Invalid ID");
    }
    const secret = process.env.JWT_SECRET + found_user.password;
    try {
      const payload = jwt.verify(url_token, secret);
      res.render("pages/newpassword.ejs", { email: found_user.email });
    } catch (error) {
      console.log(error.message);
      res.send("Invalid token");
    }
  }
);

// Handle reset password form submission
router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  if (token !== "null") {
    url_token = token;
  }
  const { password, confirm_password } = req.body;
  const found_user = await User.findById(id);
  if (found_user == null) {
    res.send("Invalid ID");
  }
  const secret = process.env.JWT_SECRET + found_user.password;
  try {
    const payload = jwt.verify(url_token, secret);
    const hashed_password = await password_hasher(password);
    found_user.password = hashed_password;
    await found_user.save();
    res.redirect("/sign-in");
  } catch (error) {
    console.log(error.message);
    res.send("Invalid token");
  }
});

export default router;
