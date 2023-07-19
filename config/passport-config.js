import passport_local from "passport-local";
import { user_finder } from "../controllers/db-crud-controller.js";
import { validate_user } from "../controllers/auth-controller.js";
import { User } from "../modules/user.js";

const localStrategy = passport_local.Strategy;

function initialize(passport) {
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
