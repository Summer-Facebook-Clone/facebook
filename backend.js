import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import { User } from "./modules/user.js";

dotenv.config();

const uri = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@instagram-clone.gxdemf6.mongodb.net/Instagram-db?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to MongoDB Atlas");
    app.listen(3000, () => {
      console.log("Server started");
    });
  })
  .catch((err) => console.error(err));

const salt_rounds = 10;

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Adds a new user to the database. user.save() is a promise. If it is successful, we add the data to the database and send the result back to the client.
// If it fails, we log the error to the console.
app.get("/add-user", (req, res) => {
  const user = new User({
    username: "test",
    password: "test",
    email: "test@gmail.com",
  });
  user
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.error(err));
});

// Finds all the users in the database and sends them back to the client.
// User.find() is a promise. If it is successful, we send the result back to the client (which is all the users).
app.get("/all-users", (req, res) => {
  User.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.error(err));
});

app.get("/sign-up", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/sign-up", (req, res) => {
  bcrypt
    .genSalt(salt_rounds)
    .then((salt) => {
      console.log("Salt: ", salt);
      return bcrypt.hash(req.body.password, salt);
    })
    .then((hash) => {
      console.log("Hash: ", hash);
        user_creator(req.body.email,req.body.full_name,req.body.username,hash);
    })
    .catch((err) => console.error(err.message));
});

app.get("/find-user", (req, res) => {
  User.findById("64a21e098b990e67b287e097")
    .then((result) => {
      res.send(result);
    })
    .catch((err) => console.error(err));
});

function user_creator(email,full_name,username,password){
    const user = new User({
        username: username,
        password: password,
        email: email,
        full_name: full_name
      });
      user
        .save()
        .then((result) => {
          res.send(result);
        })
        .catch((err) => console.error(err));
}