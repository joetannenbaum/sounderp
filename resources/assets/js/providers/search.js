'use strict'

module.exports = function(app) {

    app.service('Search', ['$q', 'SounderpSpotify', 'SoundCloud', function($q, SounderpSpotify, SoundCloud) {

        var formattedResults = [];

        var addResults = function(provider, results) {
            if (results.length > 0) {
                formattedResults.push({
                    provider: provider,
                    items: results
                });
            }
        };

        this.search = function(query) {
            formattedResults = [];

            return $q.all([
                    SounderpSpotify.search(query),
                    SoundCloud.search(query),
                ])
                .then(function(results) {
                    addResults('Spotify', results[0]);
                    addResults('SoundCloud', results[1]);

                    return formattedResults;
                });
        };

    }]);

};
