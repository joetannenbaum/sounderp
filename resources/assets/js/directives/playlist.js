'use strict'

module.exports = function(app) {
    app.directive('playlist', ['Firebase', 'Auth', '$timeout', '$filter', 'Server', function(Firebase, Auth, $timeout, $filter, Server) {
        return {
            restrict: 'E',
            templateUrl: 'playlist.html',
            link: function(scope, element) {
                scope.tracks = [];

                var orderBy = $filter('orderBy');

                var reorderTracks = function() {
                    scope.tracks = orderBy(scope.tracks, ['-votes.length', 'last_vote', 'last_played', 'added_on']);
                };

                var updateTrack = function(track) {
                    _.each(scope.tracks, function(item, key) {
                        if (item.id === track.id) {
                            scope.tracks[key] = track;
                        }
                    });

                    reorderTracks();

                    var playableUrls = _.filter(scope.tracks, {status: 'playable'});

                    Server.rebuildPlaylist(playableUrls);
                };

                var addTrack = function(track) {
                    scope.tracks.push(track);
                    reorderTracks();
                }

                $timeout(function() {
                    Firebase.listenFor.newTracks(addTrack);
                    Firebase.listenFor.updatedTracks(updateTrack);
                }, 500);

                scope.upVote = function(item) {
                    Firebase.addVote(item.id, Auth.user);
                };
            }
        };
    }]);
};
