const passport    = require('passport')
const JWT         = require('jsonwebtoken')
const PassportJwt = require('passport-jwt')
const User        = require('./Models/User');


// Configure the token.
const jwtSecret = 'QOOC3nUVl9yTZiH2F0VYjOJhwm2ZkyBjWK7Mzo4bH54cNBBUQmp262S0Tx1eBBTT'
const jwtAlgorithm = 'HS256'
const jwtExpiresIn = '7 days'

passport.use(User.createStrategy())

passport.use(
    new PassportJwt.Strategy(
        // Options
        {
            // Where will the JWT be passed in the HTTP request?
            // e.g. Authorization: Bearer xxxxxxxxxx
            jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            // What is the secret
            secretOrKey: jwtSecret,
            // What algorithm(s) were used to sign it?
            algorithms: [jwtAlgorithm]
        },
        // When we have a verified token
        (payload, done) => {
            // Find the real user from our database using the `id` in the JWT
            User.findById(payload.sub)
                .then(user => {
                    // If user was found with this id
                    if (user) {
                        done(null, user)
                    } else {
                        // If not user was found
                        done(null, false)
                    }
                })
                .catch(error => {
                    // If there was failure
                    done(error, false)
                })
        }
    )
)

function signJWTForUser(req, res) {
    // Get the user (either just signed in or signed up)
    const user = req.user
    // Create a signed token
    const token = JWT.sign(
        // payload
        {
            email: user.email
        },
        // secret
        jwtSecret,
        {
            algorithm: jwtAlgorithm,
            expiresIn: jwtExpiresIn,
            subject: user._id.toString()
        }
    )
    // Send the token
    res.json({ token, user:user })
}

module.exports = {
    initialize: passport.initialize(),
    // register,
    signIn: passport.authenticate('local', { session: false }),
    requireJWT: passport.authenticate('jwt', { session: false }),
    signJWTForUser
}
