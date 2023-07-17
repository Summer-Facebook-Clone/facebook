import passport_local from 'passport-local';
import bcrypt from "bcrypt";
const localStrategy = passport_local.Strategy;

function initizialize(passport){
    passport.use(new localStrategy({usernameField: 'username'}, async (username, password, done) => {
        const user = await user_finder(email);
        if(user == null){
            return done(null, false, {message: 'No user with that username'});
        }
    }))
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})

} 

export default initizialize;