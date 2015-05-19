'use strict'

module.exports = function(app) {

    app.service('AudioPlayer', ['$http', '$q', 'ngAudio', 'ngAudioGlobals', function($http, $q, ngAudio, ngAudioGlobals) {
        ngAudioGlobals.unlock = false;

        var players = {};

        this.getMain = function() {
            var deffered = $q.defer();

            if (players.main) {
                deffered.resolve(players.main);
            } else {
                $http.get('/config/streaming').then(function(response) {
                    players.main = ngAudio.load(response.data.full_url);
                    deffered.resolve(players.main);
                });
            }

            return deffered.promise;
        };

        this.newPlayer = function(audio_source) {
            return ngAudio.load(audio_source);
        };

    }]);
};
