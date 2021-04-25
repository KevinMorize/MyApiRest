// imports
var bcrypt = require('bcrypt');
var jwtUtils = require ('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// const
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

// routes
module.exports = {
    register: function(req, res) {

        // params
        var email = req.body.email;
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var bio = req.body.bio;
        var isAdmin = req.body.isAdmin

        if (email == null) {
            return res.status(400).json({ 'error': 'missing email' });
        } else if (password == null) {
            return res.status(400).json({ 'error': 'missing password' });
        } else if (firstName == null) {
            return res.status(400).json({ 'error': 'missing first name' });
        } else if (lastName == null) {
            return res.status(400).json({ 'error': 'missing last name' });
        }


        if (firstName.length >= 13 || firstName.length <= 3) {
            return res.status(400).json({ 'error': 'First name length must be included between 3 and 13' });
        }

        if (lastName.length >= 13 || lastName.length <= 3) {
          return res.status(400).json({ 'error': 'Last name length must be included between 3 and 13' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid' });
        }
  
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'invalid password (must length at least 8 and contain at least 1 digit, 1 special characters and 1 upper character' });
        }

        // verify var
        asyncLib.waterfall([

            function(done) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },

            function(userFound, done) {
              if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                  done(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'user already exist' });
              }
            },

            function(userFound, bcryptedPassword, done) {
              var newUser = models.User.create({
                email: email,
                password: bcryptedPassword,
                firstName: firstName,
                lastName : lastName,
                bio: bio,
                isAdmin: 0,
              })
              .then(function(newUser) {
                done(newUser);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add user' });
              });
            }
          ], function(newUser) {
            if (newUser) {
              return res.status(201).json({
                'message': 'User successfully created'
              });
            } else {
              return res.status(500).json({ 'error': 'cannot add user' });
            }
          });
        },

    login: function (req, res){

        // params
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters'});
        }

        // verify  var
        asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                  done(null, userFound, resBycrypt);
                });
              } else {
                return res.status(404).json({ 'error': 'user not exist in DB' });
              }
            },
            function(userFound, resBycrypt, done) {
              if(resBycrypt) {
                done(userFound);
              } else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
              });
            } else {
              return res.status(500).json({ 'error': 'cannot log on user' });
            }
          });
        },

    getUserProfile: function(req, res) {

        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });
        
        models.User.findOne({
            attributes: [ 'id', 'email', 'username', 'bio' ],
             where: { id: userId }
        }).then(function(user) {
            if (user) {
            res.status(201).json(user);
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
        }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
        });
    },

    updateUserProfile: function(req, res) {

        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        // Params
        var bio = req.body.bio;
        
        asyncLib.waterfall([
            function(done) {
            models.User.findOne({
                attributes: ['id', 'bio'],
                where: { id: userId }
            }).then(function (userFound) {
                done(null, userFound);
            }).catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
            });
        },
            function(userFound, done) {
            if(userFound) {
                userFound.update({
                bio: (bio ? bio : userFound.bio)
                }).then(function() {
                    done(userFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update user' });
                });
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
            },
        ], function(userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        });
    }
}