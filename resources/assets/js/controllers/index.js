'use strict'

module.exports = function(app) {

    var user;
    var mainPlayer;

    app.controller('AuthController', function(Auth) {
        Auth.auth().then(function(userData) {
            user = userData;
        });
    });

    app.controller('PlayerController', ['$scope', 'ngAudio', 'ngAudioGlobals', '$http', '$timeout', 'Firebase', function($scope, ngAudio, ngAudioGlobals, $http, $timeout, Firebase) {
        $http.get('/config/streaming').then(function(response) {
            ngAudioGlobals.unlock = false;
            mainPlayer = ngAudio.load(response.data.full_url);
            mainPlayer.play();
        });

        $scope.muted = false;

        $scope.current = {};

        var updateCurrent = function(track) {
            $scope.current = track;
        }

        var updateProgress = function() {
            var diff = moment().format('x') - $scope.current.last_played;
            $scope.current.progress = (diff / $scope.current.duration) * 100;

            $timeout(updateProgress, 1000);
        }

        updateProgress();

        $timeout(function() {
            Firebase.listenFor.currentlyPlaying(updateCurrent);
            Firebase.getCurrentlyPlaying(updateCurrent);
        }, 500);

        $scope.mutePlayer = function() {
            mainPlayer.volume = 0;
            $scope.muted = true;
        };

        $scope.unmutePlayer = function() {
            mainPlayer.volume = 1;
            $scope.muted = false;
        };
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

    app.controller('SearchController', ['$scope', 'Firebase', 'SounderpSpotify', 'SoundCloud', 'YouTube', 'Server', 'ngAudio', 'ngAudioGlobals', function($scope, Firebase, SounderpSpotify, SoundCloud, YouTube, Server, ngAudio, ngAudioGlobals) {
        $scope.query          = '';
        $scope.results        = [];
        ngAudioGlobals.unlock = false;

        var pauseOtherPreviews = function() {
            _.each($scope.results, function(provider) {
                _.each(provider.items, function(item) {
                    if (item.previewing) {
                        item.player.pause();
                        item.previewing = false;
                    }
                });
            });
        }

        $scope.clearSearch = function() {
            $scope.results = [];
            $scope.query = '';
        }

        $scope.addTrack = function(item) {
            var track = angular.copy(item);

            track.status = 'processing';
            track.votes  = [];

            if (item.sources[0].type === 'spotify') {
                YouTube.search(item.title + ' ' + item.artist, item.duration).then(function(results) {
                    track.sources.push(results);
                    Firebase.addTrack(track).then(function(response) {
                        Server.processTrack(response);
                    });
                });
            } else {
                Firebase.addTrack(track).then(function(response) {
                        Server.processTrack(response);
                    });
            }
        }

        $scope.playPreview = function(item) {
            pauseOtherPreviews();

            mainPlayer.volume = 0;

            item.player = ngAudio.load(item.preview_url);
            item.player.play();
            item.previewing = true;
        }

        $scope.pausePreview = function(item) {
            item.player.pause();
            item.previewing = false;

            mainPlayer.volume = 1;
        }

        $scope.searchForTracks = function() {
            $scope.results = [];

            var addResults = function(provider, results) {
                if (results.length > 0) {
                    $scope.results.push({
                        provider: provider,
                        items: results
                    });
                }
            };

            SounderpSpotify.search($scope.query).then(function(response) {
                addResults('Spotify', response);
            });

            SoundCloud.search($scope.query).then(function(response) {
                addResults('SoundCloud', response);
            });
        }
    }]);
};
