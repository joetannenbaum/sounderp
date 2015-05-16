'use strict'

module.exports = function(app) {

    app.service('SounderpSpotify', ['Spotify', '$http', function(Spotify, $http) {

        $http.get('/config/spotify').then(function(response) {
            app.config(function(SpotifyProvider) {
                SpotifyProvider.setClientId('asdfasfsafsadfs');
                SpotifyProvider.setAuthToken('asdfasfsafsadfs');
            });
        });

        this.search = function(query) {
            return Spotify.search(query, 'track').then(function(data) {
                return _.map(data.tracks.items, function (item) {
                    return {
                        title: item.name,
                        url: item.external_urls.spotify,
                        thumbnail: item.album.images[item.album.images.length - 1].url,
                        artist: _.pluck(item.artists, 'name').join(', '),
                        preview_url: item.preview_url,
                        duration: item.duration_ms,
                        sources: [
                            {
                                type: 'spotify',
                                url: item.external_urls.spotify
                            }
                        ]
                    };
                });
            });
        };

    }]);

}
