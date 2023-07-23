import app from "./config/server.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { User } from "./modules/user.js";
import { UserOTPVerification } from "./modules/userOTPVerification.js";
import { authenticate } from "./config/server.js";
import { user_finder } from "./controllers/db-crud-controller.js";
import {
  check_authentication,
  not_authenticated,
  password_hasher,
  send_OTP_verification_email,
  validate_user,
} from "./controllers/auth-controller.js";
import {
  user_creator,
  instagram_media_fetcher,
} from "./controllers/db-crud-controller.js";
import sendMail from "./controllers/mailer-controller.js";
import ip_finder from "./controllers/os-controller.js";
import { error } from "console";


// url_token is used to store the token that is sent to the user's email when they request to reset their password
let url_token = null;

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
  password_hasher(req.body.password).then(async (hash) => {
    user_creator(req.body.email, req.body.full_name, req.body.username, hash);
    const found_user = await user_finder(req.body.username);
    res.render("pages/verify-account.ejs", { email: req.body.email, userId: found_user._id })
    // res.redirect("/sign-in");
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
app.get("/forgot-password", not_authenticated, (req, res) => {
  res.render("pages/resetpassword.ejs");
});

// Handle forgot password form submission
app.post("/forgot-password", async (req, res) => {
  const username = req.body.username;
  const found_user = await user_finder(username);
  if (found_user !== null) {
    const secret = process.env.JWT_SECRET + found_user.password;
    const payload = {
      email: found_user.email,
      id: found_user._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://${ip_finder()["Wi-Fi"][0]}:3000/reset-password/${
      found_user._id
    }/${token}`;
    sendMail(
      found_user.email,
      "Reset password request",
      link,
      `<h1>Password:</h1><h2>${link}</h2>`
    ).catch((error) => {
      console.log(error.message);
    });
    res.send("Password reset link has been sent to your email address");
  } else {
    res.send("User not found");
  }
});

// reset password route
app.get("/reset-password/:id/:token", not_authenticated, async (req, res) => {
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
});

// Handle reset password form submission
app.post("/reset-password/:id/:token", async (req, res) => {
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

app.post("/verify-account", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw new Error("Invalid request");
    } else {
      const userOTPVerification =  await UserOTPVerification.findOne({
        userID: userId,
      });
      if (!userOTPVerification) {
        throw new Error("Account record does not exist or has been verified already");
      } else {
        const { expiresAt } = userOTPVerification;
        const hashed_otp = userOTPVerification.otp;
        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteOne({ userID: userId });
          throw new Error("OTP has expired. Please request a new OTP");
        } else {
          const result = await validate_user(otp, hashed_otp);
          if (!result) {
            throw new Error("Invalid OTP");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await UserOTPVerification.deleteOne({ userID: userId });
            res.send("Account verified successfully");
          }
        }
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/resendOTP", async (req, res) => {
  try {
    const { userId,email } = req.body;
    if (!userId || !email) {
      throw new Error("Invalid request");
    } else {
      await UserOTPVerification.deleteOne({ userID: userId });
      await send_OTP_verification_email(userId, email);
      res.json({ message: "OTP sent successfully" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

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
