// imports
var models = require('../models');
var asyncLib = require('async');
var jwtUtils = require ('../utils/jwt.utils');


// constants
const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;

//routes
module.exports = {
    createMessage: function (req, res){

        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // params
        var title = req.body.title;
        var content = req.body.content;

        if (title == null || content == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
            return res.status(400).json({ 'error': 'invalid parameters' })
        }

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: { id: userId }
                }).then(function (userFound) {
                    done(null, userFound);
                }).catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
            },
            function(userFound, done) {
                if(userFound) {
                    models.Message.create({
                        title: title,
                        content: content,
                        likes: 0,
                        UserId : userFound.id
                    })
                    .then(function(newMessage){
                        done(null, userFound, newMessage);
                    })
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            }

        ], function(newMessage) {

        });

    },

    listMessages: function (req, res){

    }
}