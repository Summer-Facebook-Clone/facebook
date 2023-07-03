import mongoose from "mongoose";
const { Schema } = mongoose.Schema;

// We create a schema for the user. This tells us that whenever we create a new user, it must have a particular structure.
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    password: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    profilePicture: { type: String, default: "" },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
}, {timestamps: true});

// User gets translated to Users collection automatically in the database that's why we use User instead of Users
const User = mongoose.model('User', userSchema);

// We export the User model so that we can use it in other files
module.exports = User;