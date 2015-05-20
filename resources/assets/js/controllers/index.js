'use strict'

module.exports = function(app) {
    app.controller('AuthController', ['Auth', '$scope', function(Auth, $scope) {
        $scope.authed = false;

        Auth.auth().then(function(userData) {
            $scope.authed = true;
        });
    }]);
};
