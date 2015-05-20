'use strict'

module.exports = function(app) {
    app.directive('playlistActions', [function() {
        return {
            restrict: 'E',
            templateUrl: 'playlist-actions.html'
        };
    }]);
};
