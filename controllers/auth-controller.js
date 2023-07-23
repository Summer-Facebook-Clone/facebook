import bcrypt from "bcrypt";
import { User } from "../modules/user.js";
import sendMail from "./mailer-controller.js";
import { UserOTPVerification } from "../modules/userOTPVerification.js";
import jwt from "jsonwebtoken";
import ip_finder from "./os-controller.js";
import axios from "axios";

// Number of salt rounds for bcrypt hashing
const salt_rounds = 10;

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
 * Validates a password by comparing it with a hash using bcrypt.
 * @param {string} password - The password to validate.
 * @param {string} hash - The hash to compare the password with.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the password is valid or not, or rejects with an error.
 */
async function validate_hash(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error(err.message);
    return false;
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
    if (req.user.verified) {
      return next();
    }
    axios.post("http://localhost:3000/resendOTP", { email: req.user.email, userId: req.user._id })
    return res.redirect(`/verify-account/${req.user.email}/${req.user._id}`);
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

/**
 * Generates a password reset link.
 * @param {User} found_user - The user to generate the password reset link for.
 * @returns {string} The password reset link.
 */
function generate_password_reset_link(found_user) {
  const secret = process.env.JWT_SECRET + found_user.password;
  const payload = {
    email: found_user.email,
    id: found_user._id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `http://${ip_finder()["Wi-Fi"][0]}:3000/reset-password/${
    found_user._id
  }/${token}`;
  return link;
}

/**
 * Sends an OTP verification email to the user.
 * @param {string} _id - The user's ID.
 * @param {string} email - The user's email address.
 * @returns {void}
 */
async function send_OTP_verification_email(_id, email) {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    password_hasher(otp).then(async (hashed_otp) => {
      const userOTPVerification = new UserOTPVerification({
        userID: _id,
        otp: hashed_otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
      await userOTPVerification.save();
      sendMail(
        email,
        "OTP Verification",
        `Your OTP is ${otp}`,
        `<p>Your OTP is <b>${otp}</b>.<br>Enter this number in the app to verify your account.<br>This number expires in one hour!</p>`
      );
    });
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Verifies an OTP.
 * @param {string} userId - The user's ID.
 * @param {string} otp - The OTP to verify.
 * @param {Response} res - The response object.
 * @returns {void}
 */
async function verify_otp(userId, otp, res) {
  const userOTPVerification = await UserOTPVerification.findOne({
    userID: userId,
  });
  if (!userOTPVerification) {
    res.send("Account does not exist or has already been verified");
  } else {
    const { expiresAt } = userOTPVerification;
    const hashed_otp = userOTPVerification.otp;
    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteOne({ userID: userId });
      res.send("OTP has expired. Please request a new OTP");
    } else {
      const result = await validate_hash(otp, hashed_otp);
      if (!result) {
        res.send("Invalid OTP");
      } else {
        await User.updateOne({ _id: userId }, { verified: true });
        await UserOTPVerification.deleteOne({ userID: userId });
        res.send("Account verified successfully");
      }
    }
  }
}

export {
  validate_hash,
  check_authentication,
  not_authenticated,
  password_hasher,
  generate_password_reset_link,
  send_OTP_verification_email,
  verify_otp,
};
