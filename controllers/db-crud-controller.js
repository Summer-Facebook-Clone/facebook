import axios from "axios";
import { User } from "../modules/user.js";
import { Post } from "../modules/post.js";

/**
 * Retrieves a user from the database based on the username or email.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<User>} A promise that resolves with the retrieved user, or rejects with an error.
 */
function user_finder(identifier) {
  return new Promise((resolve, reject) => {
    let query = {};
    if (typeof identifier === "string") {
      query = { $or: [{ username: identifier }, { email: identifier }] };
    } else {
      reject(new Error("Invalid identifier type"));
    }
    User.findOne(query)
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Adds a new user to the database.
 * @param {string} email - The email of the user.
 * @param {string} full_name - The full name of the user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {void}
 */
function user_creator(email, full_name, username, password) {
  const user = new User({
    username: username,
    password: password,
    email: email,
    full_name: full_name,
  });
  user.save().catch((err) => console.error(err));
}

/**
 * Creates a new post for the current user based on the image url that is fetched using Instagram basic display API.
 * @param {User} user - The user that is currently logged in.
 * @param {string} image_url - The URL of the image to be posted.
 * @param {string} caption - The caption of the post.
 */
async function post_creator_from_instagram(user, image_url, caption) {
  const post = await Post.create({
    caption: caption,
    image_url: image_url,
    user: user._id,
  });
  user.posts.push(post._id);
  await user.save();
}

/**
 * Fetches user's media from the Instagram API and saves it to the current user's document in the database.
 * @param {string} url - The URL of the Instagram API endpoint to fetch the media from.
 * @param {User} current_user - The user that is currently logged in.
 * @returns {void}
 */
async function instagram_media_fetcher(current_user, url) {
  try {
    let response = await axios.get(url);

    while (true) {
      for (let i = 0; i < response.data.data.length; i++) {
        await post_creator_from_instagram(
          current_user,
          response.data.data[i].media_url,
          response.data.data[i].caption
        );
      }

      if (response.data.paging.next) {
        response = await axios.get(response.data.paging.next);
      } else {
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export { user_finder, user_creator, instagram_media_fetcher };
