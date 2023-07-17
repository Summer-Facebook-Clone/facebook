import passport_local from "passport-local";
import bcrypt from "bcrypt";
import { User } from "./modules/user.js";
const localStrategy = passport_local.Strategy;

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

function initialize(passport, user_finder) {
  const authenticate_user = async (username, password, done) => {
    const user = await user_finder(username);
    if (user == null) {
      return done(null, false, { message: "Password or Username incorrect" });
    }
    try {
      if (await validate_user(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password or Username incorrect" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(
    new localStrategy({ usernameField: "username" }, authenticate_user)
  );
  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
}

export default initialize;
