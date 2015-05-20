'use strict'

module.exports = function(app) {
    app.directive('onlineUsers', ['Firebase', '$timeout', function(Firebase, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'online-users.html',
            link: function(scope, element) {
                scope.users = {};

                var updateUserList = function(user) {
                    for (var id in user) {
                        scope.users[id] = user[id];
                    }
                };

                $timeout(function() {
                    Firebase.listenFor.onlineUsers(updateUserList);
                }, 500);
            }
        };
    }]);
};
