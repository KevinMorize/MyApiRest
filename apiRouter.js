// imports

var express = require('express');
var usersController = require('./routes/usersController');
var messagesController = require('./routes/messagesController');
var likesController = require('./routes/likesController');


// router
exports.router = (function() {
    var apiRouter = express.Router();

    // users routes
    apiRouter.route('/users/register/').post(usersController.register);
    apiRouter.route('/users/login/').post(usersController.login);
    apiRouter.route('/users/me/').get(usersController.getUserProfile);
    apiRouter.route('/users/me/').put(usersController.updateUserProfile);
    apiRouter.route('/users/all/').get(usersController.getAllUsers);

    apiRouter.route('/users/get/:id/').get(usersController.getUserById);
    apiRouter.route('/users/delete/:id').post(usersController.deleteUser);


    // messages routes
    apiRouter.route('/messages/new/').post(messagesController.createMessage);
    apiRouter.route('/messages/').get(messagesController.listMessages);

    // likes
    apiRouter.route('/messages/vote/:messageId/like').post(likesController.likePost);
    apiRouter.route('/messages/vote/:messageId/dislike').post(likesController.dislikePost);

    return apiRouter

})();
