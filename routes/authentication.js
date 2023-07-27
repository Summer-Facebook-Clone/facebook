// import express from "express";
// const router = express.Router();
// import {
//   check_authentication,
//   not_authenticated,
//   password_hasher,
//   generate_password_reset_link,
//   send_OTP_verification_email,
//   verify_otp,
// } from "../controllers/auth-controller.js";
// import { authenticate } from "../config/server.js";

// // Sign up route
// router.get("/sign-up", not_authenticated, (req, res) => {
//   res.sendFile(__dirname + "/signup.html");
// });

// // Handle sign-up form submission
// router.post("/sign-up", (req, res) => {
//   password_hasher(req.body.password).then(async (hash) => {
//     user_creator(req.body.email, req.body.full_name, req.body.username, hash);
//     const found_user = await user_finder(req.body.username);
//     res.redirect(`/verify-account/${found_user.email}/${found_user._id}`);
//   });
// });

// // Sign in route
// router.get("/sign-in", not_authenticated, (req, res) => {
//   res.render("pages/signin.ejs");
// });

// // Handle sign-in form submission
// if (authenticate) {
//   router.post("/sign-in", authenticate);
// }

// router.delete("/sign-out", (req, res) => {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/home");
//   });
// });

// export default router;
