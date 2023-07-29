import express from "express";
import { fileURLToPath } from "url";
import { user_creator } from "../controllers/db-crud-controller.js";
import { user_finder } from "../controllers/db-crud-controller.js";
import {
  credential_validator,
  not_authenticated,
  password_hasher
} from "../controllers/auth-controller.js";
import { authenticate } from "../config/server.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL("../", import.meta.url));

// Sign up route
router.get("/sign-up", not_authenticated, (req, res) => {
  const flashMessage = req.flash("error");
  res.render("pages/signup.ejs", { flashMessage: flashMessage });
});

// Handle sign-up form submission
router.post("/sign-up", (req, res) => {
  const validate_object = credential_validator(req.body.password, req.body.email);
  if (validate_object.is_strong_password && validate_object.is_email) {
    password_hasher(req.body.password).then(async (hash) => {
      user_creator(req.body.email, req.body.full_name, req.body.username, hash);
      const found_user = await user_finder(req.body.username);
      res.redirect(`/verify-account/${found_user.email}/${found_user._id}`);
    });
  } else if (!validate_object.is_strong_password) {
    req.flash(
      "error",
      "Password is not strong enough. Your password must contain at least 8 characters, 1 upper-case,1 lower-case and 1 number."
    );
    res.redirect("/sign-up");
  }else if (!validate_object.is_email) {
    req.flash(
      "error",
      "Email is not valid."
    );
    res.redirect("/sign-up");
  }
});

// Sign in route
router.get("/sign-in", not_authenticated, (req, res) => {
  res.render("pages/signin.ejs");
});

// Handle sign-in form submission
router.post("/sign-in", authenticate);

// Handle sign-out form submission
router.delete("/sign-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/home");
  });
});

export default router;
