import express from "express";
import { verify_otp } from "../controllers/auth-controller.js";
import { send_OTP_verification_email } from "../controllers/mailer-controller.js";
import { UserOTPVerification } from "../modules/userOTPVerification.js";

const router = express.Router();

router.get("/verify-account/:email/:usedId", (req, res) => {
  const flashMessage = req.flash("error");
  res.render("pages/verify-account.ejs", {
    email: req.params.email,
    userId: req.params.usedId,
    flashMessage: flashMessage,
  });
});

// Handle OTP verification form submission
router.post("/verify-account/:email/:usedId", async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      res.status(400).send("Invalid request");
    } else {
      verify_otp(userId, otp).then((result) => {
        if (result) {
          res.redirect("/sign-in");
        } else {
          req.flash("error", "Invalid OTP. Please try again.");
          res.redirect(
            `/verify-account/${req.params.email}/${req.params.usedId}`
          );
        }
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Handle OTP resend form submission
router.post("/resendOTP", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      throw new Error("Invalid request");
    } else {
      await UserOTPVerification.deleteOne({ userID: userId });
      send_OTP_verification_email(userId, email);
      res.json({ message: "OTP sent successfully" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

export default router;
