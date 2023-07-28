import express from "express";
import { fileURLToPath } from "url";
import {user_creator} from "../controllers/db-crud-controller.js";
import { user_finder } from "../controllers/db-crud-controller.js";
import {
  not_authenticated,
  password_hasher,
} from "../controllers/auth-controller.js";
import { authenticate } from "../config/server.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL("../", import.meta.url));

// Sign up route
router.get("/sign-up", not_authenticated, (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// Handle sign-up form submission
router.post("/sign-up", (req, res) => {
  password_hasher(req.body.password).then(async (hash) => {
    user_creator(req.body.email, req.body.full_name, req.body.username, hash);
    const found_user = await user_finder(req.body.username);
    res.redirect(`/verify-account/${found_user.email}/${found_user._id}`);
  });
});

// Sign in route
router.get("/sign-in", not_authenticated, (req, res) => {
  res.render("pages/signin.ejs");
});

// Handle sign-in form submission
if (authenticate) {
  router.post("/sign-in", authenticate);
}

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
