var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromBodyField('token');
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload.id}, (err, user) => {
            if (err) {
                console.log(err);
                return done(err, false);
            } else if (user) {
                console.log(user);
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

let verifyAdmin = function (req,res,next) {
    console.log(req.user.admin);
        if (req.user.admin) {
            console.log('Autorizado');
            return next();
        } else {
            let error = new Error('You are not authorized to perform this operation!');
            error.status = 403;
            return next(error);
        }
    }

exports.verifyAdmin = verifyAdmin;


