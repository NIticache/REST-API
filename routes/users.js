var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../authenticate');

var users = express.Router();

users.use(bodyParser.json());
/* GET users listing. */
users
    .get('/', authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
        User.find({})
            .then((users) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(users);
                },
                (error => {
                    next(error);
                }))
            .catch((error) => {
                next(error);
            })
    })

users.post('/signup', (req, res, next) => {
    User.register(new User({username: req.body.username}),
        req.body.password, (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                if(req.body.firstname){
                    user.firstname = req.body.firstname
                }if(req.body.lastname){
                    user.lastname = req.body.lastname
                }
                user.save((error,user)=>{
                    if(error){
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    });
                });

            }
        });
});

users.post('/login', passport.authenticate('local'), (req, res) => {

    var token = authenticate.getToken({id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

users.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});

users.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        var error = new Error('You are not logged in');
        error.status = 403;
        next(error);
    }
});


module.exports = users;