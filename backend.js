import app from "./config/server.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { User } from "./modules/user.js";
import { authenticate } from "./config/server.js";
import { user_finder } from "./config/passport-config.js";
import {
  check_authentication,
  not_authenticated,
  password_hasher,
} from "./controllers/auth-controller.js";
import {
  user_creator,
  post_creator_from_instagram,
  instagram_media_fetcher,
} from "./controllers/db-crud-controller.js";

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
  instagram_media_fetcher(
    req.user,
    "https://graph.instagram.com/me/media?fields=id,caption,media_url&access_token=IGQVJXVTFpMTc2VlhKekVydDN1dmwzZAHVLZAkNsQTNtazAxV1NMRE45RGZAZAeVBFVC1wdEx6ZA0RLQ1Fvd21KTnQySmZAXX1JSOFhiQWlaOUtDX3RKcVJxMmZAoVTBuV3VFbEtHenhkRWRaM1lQWm9FTlZArdAZDZD"
  );
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
    const link = `http://localhost:3000/reset-password/${found_user._id}/${token}`;
    console.log(link);
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
