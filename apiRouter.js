// imports

var express = require('express');
var usersController = require('./routes/usersController');
// var messagesController = require('./routes/messagesController');
// var likesController    = require('./routes/likesController');


// router
exports.router = (function() {
    var apiRouter = express.Router();

    // users routes
    apiRouter.route('/users/register/').post(usersController.register);
    apiRouter.route('/users/login/').post(usersController.login);
    apiRouter.route('/users/me/').get(usersController.getUserProfile);
    apiRouter.route('/users/me/').put(usersController.updateUserProfile);

    return apiRouter

})();