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

    apiRouter.route('/user/:id/').get(usersController.getUserById);
    apiRouter.route('/users/delete/:id').post(usersController.deleteUser);

    apiRouter.route('/users/all/').get(usersController.getAllUsers);
    


    return apiRouter

})();
