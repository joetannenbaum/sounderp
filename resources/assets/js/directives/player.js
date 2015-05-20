'use strict'

module.exports = function(app) {
    app.directive('player', ['AudioPlayer', '$timeout', 'Firebase', '$cookieStore', function(AudioPlayer, $timeout, Firebase, $cookieStore) {
        return {
            restrict: 'E',
            templateUrl: 'player.html',
            link: function(scope, element) {
                var player;

                AudioPlayer.getMain().then(function(mainPlayer) {
                    player = mainPlayer;

                    player.play();

                    if (scope.muted) {
                        player.volume = 0;
                    }
                });

                scope.muted = $cookieStore.get('player-muted');

                scope.current = {};

                var updateCurrent = function(track) {
                    scope.current = track;
                }

                var updateProgress = function() {
                    var diff = moment().format('x') - scope.current.last_played;
                    scope.current.progress = (diff / scope.current.duration) * 100;

                    $timeout(updateProgress, 1000);
                }

                updateProgress();

                $timeout(function() {
                    Firebase.listenFor.currentlyPlaying(updateCurrent);
                    Firebase.getCurrentlyPlaying(updateCurrent);
                }, 500);

                scope.mutePlayer = function() {
                    player.volume = 0;
                    scope.muted = true;

                    $cookieStore.put('player-muted', true);
                };

                scope.unmutePlayer = function() {
                    player.volume = 1;
                    scope.muted = false;

                    $cookieStore.put('player-muted', false);
                };
            }
        };
    }]);
};
