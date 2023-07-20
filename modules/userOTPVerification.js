import mongoose from "mongoose";
import { Schema } from "mongoose";

const userOTPVerificationSchema = new Schema({
    userID:String,
    otp:String,
    createdAt:Date,
    expiresAt: Date
});

const UserOTPVerification = mongoose.model("UserOTPVerification", userOTPVerificationSchema);

export { UserOTPVerification };
