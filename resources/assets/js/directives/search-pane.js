'use strict'

module.exports = function(app) {
    app.directive('searchPane', [
                    'Firebase',
                    'Search',
                    'YouTube',
                    'Server',
                    'AudioPlayer',
                    function(Firebase, Search, YouTube, Server, AudioPlayer) {
        return {
            restrict: 'E',
            templateUrl: 'search-pane.html',
            link: function(scope, element) {
                scope.query   = '';
                scope.results = [];

                var pauseOtherPreviews = function() {
                    _.each(scope.results, function(provider) {
                        _.each(provider.items, function(item) {
                            if (item.previewing) {
                                item.player.pause();
                                item.previewing = false;
                            }
                        });
                    });
                }

                var pushTrack = function(track) {
                    Firebase.addTrack(track).then(function(response) {
                        Server.processTrack(response);
                    });
                };

                scope.clearSearch = function() {
                    scope.results = [];
                    scope.query   = '';
                };

                scope.addTrack = function(item) {
                    var track = angular.copy(item);

                    track.status = 'processing';
                    track.votes  = [];

                    if (item.sources[0].type === 'spotify') {
                        YouTube.search(item.title + ' ' + item.artist, item.duration)
                            .then(function(result) {
                                track.sources.push(result);
                                pushTrack(track);
                            });
                    } else {
                        pushTrack(track);
                    }
                };

                scope.playPreview = function(item) {
                    pauseOtherPreviews();

                    AudioPlayer.getMain().then(function(player) {
                        player.volume = 0;
                    });

                    item.player = AudioPlayer.newPlayer(item.preview_url);
                    item.player.play();
                    item.previewing = true;
                };

                scope.pausePreview = function(item) {
                    item.player.pause();
                    item.previewing = false;

                    AudioPlayer.getMain().then(function(player) {
                        player.volume = 1;
                    });
                };

                scope.searchForTracks = function() {
                    if (scope.query.includes('youtube.com')) {
                        YouTube.searchFromUrl(scope.query).then(function(track) {
                            scope.addTrack(track);
                            scope.query = '';
                        });
                    } else {
                        Search.search(scope.query).then(function(response) {
                            scope.results = response;
                        });
                    }
                };
            }
        };
    }]);
};
