import mongoose from "mongoose";
const Schema = mongoose.Schema;

//We create a schema for the post. This tells us that whenever we create a new post, it must have a particular structure.
const postSchema = new Schema(
  {
    caption: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

//Post gets translated to Posts collection automatically in the database that's why we use Post instead of Posts
const Post = mongoose.model("Post", postSchema);

//We export the Post model so that we can use it in other files
export { Post };
