import passport_local from "passport-local";
import bcrypt from "bcrypt";
const localStrategy = passport_local.Strategy;

/**
 * Retrieves a user from the database based on the username.
 * @param {string} username - The username of the user to find.
 * @returns {Promise<User>} A promise that resolves with the retrieved user, or rejects with an error.
 */
function user_finder(username) {
  return new Promise((resolve, reject) => {
    User.findOne({ username: username })
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Validates a password by comparing it with a hash using bcrypt.
 * @param {string} password - The password to validate.
 * @param {string} hash - The hash to compare the password with.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the password is valid or not, or rejects with an error.
 */
async function validate_user(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

function initizialize(passport) {
  passport.use(
    new localStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        const user = await user_finder(username);
        if (user == null) {
          return done(null, false, { message: "No user with that username" });
        }
        try {
          if (await validate_user(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {});
  passport.deserializeUser((id, done) => {});
}

export default initizialize;
