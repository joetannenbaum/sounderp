'use strict'

module.exports = function(app) {
    app.controller('AuthController', ['Auth', function(Auth) {
        Auth.auth().then(function(userData) {

        });
    }]);
};
