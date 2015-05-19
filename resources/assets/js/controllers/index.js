'use strict'

module.exports = function(app) {

    var user;

    app.controller('AuthController', ['Auth', function(Auth) {
        Auth.auth().then(function(userData) {
            user = userData;
        });
    }]);

    app.controller('OnlineController', ['$scope', '$timeout', 'Firebase', function($scope, $timeout, Firebase) {
        $scope.users = {};

        var updateUserList = function(user) {
            for (var id in user) {
                $scope.users[id] = user[id];
            }
        };

        $timeout(function() {
            Firebase.listenFor.onlineUsers(updateUserList);
        }, 500);
    }]);

    app.controller('ListController', ['$scope', 'Firebase', '$timeout', '$filter', 'Server', function($scope, Firebase, $timeout, $filter, Server) {
        $scope.tracks = [];

        var orderBy = $filter('orderBy');

        var reorderTracks = function() {
            $scope.tracks = orderBy($scope.tracks, ['-votes.length', 'last_vote', 'last_played', 'added_on']);
        };

        var updateTrack = function(track) {
            _.each($scope.tracks, function(item, key) {
                if (item.id === track.id) {
                    $scope.tracks[key] = track;
                }
            });

            reorderTracks();

            var playableUrls = _.filter($scope.tracks, {status: 'playable'});

            Server.rebuildPlaylist(playableUrls);
        };

        var addTrack = function(track) {
            $scope.tracks.push(track);
            reorderTracks();
        }

        $timeout(function() {
            Firebase.listenFor.newTracks(addTrack);
            Firebase.listenFor.updatedTracks(updateTrack);
        }, 500);

        $scope.upVote = function(item) {
            Firebase.addVote(item.id, user);
        };
    }]);
};
