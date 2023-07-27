import mongoose from "mongoose";

const connectDB = async () => {
  // MongoDB Atlas connection URI
  const uri = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@instagram-clone.gxdemf6.mongodb.net/Instagram-db?retryWrites=true&w=majority`;

  // Connect to MongoDB Atlas and start the server
  await mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
      console.log("Connected to MongoDB Atlas");
    })
    .catch((err) => console.error(err));
};

export default connectDB;
