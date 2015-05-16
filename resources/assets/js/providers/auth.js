'use strict'

module.exports = function(app) {

    app.service('Auth', ['Firebase', '$timeout', '$q', function(Firebase, $timeout, $q) {

        var userData;

        this.user = function() {
            return userData;
        };

        this.auth = function() {
            var deferred = $q.defer();

            if (userData) {
                deferred.resolve(userData);
            } else {
                $timeout(function() {
                    Firebase.auth().then(function(data) {
                        userData = data;

                        deferred.resolve(data);
                    });
                }, 500);
            }

            return deferred.promise;
        };

    }]);

}
