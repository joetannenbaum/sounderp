'use strict'

module.exports = function(app) {

    app.service('SoundCloud', ['$http', '$q', function($http, $q) {

        $http.get('/config/soundcloud')
                            .then(function(response) {
                                SC.initialize({
                                    client_id: response.data.client_id
                                });
                            });

        this.search = function(query) {
            var deferred = $q.defer();

            SC.get('/tracks', { q: query }, function(items) {
                var results = _.map(items, function (item) {
                    if (item.kind == 'track') {
                        return {
                            title: item.title,
                            art: {
                                full: item.artwork_url,
                                thumbnail: item.artwork_url,
                            },
                            artist: item.user.username,
                            duration: item.duration,
                            sources: [
                                {
                                    type: 'soundcloud',
                                    url: item.permalink_url
                                }
                            ]
                        };
                    }
                    console.error(item);
                });

                deferred.resolve(results);
            });

            return deferred.promise;
        };
    }]);

}
