import app from "./config/server.js";
import { fileURLToPath } from "url";
import { instagram_media_fetcher } from "./controllers/db-crud-controller.js";
import {
  check_authentication,
  not_authenticated,
} from "./controllers/auth-controller.js";
import authentication_route from "./routes/authentication.js";
import reset_password_route from "./routes/reset-password.js";
import verification_route from "./routes/verification.js";

app.use("/", authentication_route);
app.use("/", reset_password_route);
app.use("/", verification_route);

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
app.get("/sign-up", not_authenticated, authentication_route);

// // Handle sign-up form submission
app.post("/sign-up", authentication_route);

// Sign in route
app.get("/sign-in", not_authenticated, authentication_route);

// Handle sign-in form submission
app.post("/sign-in", authentication_route);

// Handle sign-out form submission
app.delete("/sign-out", authentication_route);

// forgot password route
app.get("/forgot-password", reset_password_route);

// Handle forgot password form submission
app.post("/forgot-password", reset_password_route);

// reset password route
app.get("/reset-password/:id/:token", reset_password_route);

// Handle reset password form submission
app.post("/reset-password/:id/:token", reset_password_route);

app.get("/verify-account/:email/:usedId", verification_route);

// Handle OTP verification form submission
app.post("/verify-account/:email/:usedId", verification_route);

// Handle OTP resend form submission
app.post("/resendOTP", verification_route);

