'use strict'

module.exports = function(app) {

    var user;
    var mainPlayer;

    app.controller('AuthController', function(Auth) {
        Auth.auth().then(function(userData) {
            user = userData;
        });
    });

    app.controller('PlayerController', ['$scope', 'ngAudio', 'ngAudioGlobals', '$http', function($scope, ngAudio, ngAudioGlobals, $http) {
        $http.get('/config/streaming').then(function(response) {
            ngAudioGlobals.unlock = false;
            mainPlayer = ngAudio.load(response.data.full_url);
            mainPlayer.play();
        });
    }]);

    app.controller('ListController', ['$scope', 'Firebase', '$timeout', function($scope, Firebase, $timeout) {
        $scope.tracks = [];

        var updateTrack = function(track) {
            _.each($scope.tracks, function(item, key) {
                if (item.id === track.id) {
                    $scope.tracks[key] = track;
                }
            });
        }

        $timeout(function() {
            Firebase.listenFor.newTracks($scope.tracks);
            Firebase.listenFor.updatedTracks(updateTrack);
        }, 500);

        $scope.upVote = function(item) {
            Firebase.addVote(item.id, user);
        }
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
                Firebase.addTrack(track);
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
