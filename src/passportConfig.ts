import Auth0Strategy = require('passport-auth0');
import session = require('express-session');

let preparePassport = (app, passport) => {
    var strategy = new Auth0Strategy({
        domain:       'pftransfer.auth0.com',
        clientID:     'vDJInl1tRNLjgCnWDlPxqYSoLaFmao3r',
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL:  '/callback'
       },
       function(accessToken, refreshToken, extraParams, profile, done) {
         // accessToken is the token to call Auth0 API (not needed in the most cases)
         // extraParams.id_token has the JSON Web Token
         // profile has all the information from the user
         return done(null, profile);
       }
    );
    passport.use(strategy);
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        // store: process.env.REDIS_URL ? new RedisStore({ url: process.env.REDIS_URL }) : null
        store: session.MemoryStore()
    }));
    app.use(passport.initialize());
    app.use(passport.session());
};

export {
    preparePassport
}
