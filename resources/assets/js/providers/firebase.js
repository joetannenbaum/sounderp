'use strict'

module.exports = function(app) {

    app.service('Firebase', ['$http', '$q', function($http, $q) {
        var obj   = this;
        var users = {};

        this.fb = {};

        $http.get('/config/firebase').then(function(response) {
            obj.fb.url = response.data.url;

            obj.fb.tracks = new Firebase(obj.fb.url + '/tracks');
            obj.fb.users  = new Firebase(obj.fb.url + '/users');
            obj.fb.base   = new Firebase(obj.fb.url);
        });

        this.getUser = function(user_id) {
            var deferred = $q.defer();

            if (users[user_id]) {
                deferred.resolve(users[user_id]);
            } else {
                this.fb.users.child(user_id).once('value', function(snapshot) {
                    users[user_id] = snapshot.val();

                    deferred.resolve(snapshot.val());
                });
            }

            return deferred.promise;
        };

        this.formatAuthData = function(authData) {
            return {
                        auth: authData.auth,
                        first_name: authData.facebook.cachedUserProfile.first_name,
                        last_name: authData.facebook.cachedUserProfile.last_name,
                        name: authData.facebook.cachedUserProfile.name,
                        id: authData.facebook.cachedUserProfile.id,
                        photo: authData.facebook.cachedUserProfile.picture.data.url
                    };
        };

        this.auth = function() {
            var deferred = $q.defer();
            var authData = this.fb.base.getAuth();

            if (authData) {
                deferred.resolve(this.formatAuthData(authData));
            } else {
                this.fb.base.authWithOAuthPopup('facebook', function(error, authData) {
                    var user = obj.formatAuthData(authData);

                    obj.fb.users.child(authData.uid).set(user);

                    deferred.resolve(user);
                }, { remember: 'sessionOnly' });
            }

            return deferred.promise;
        }

        this.addTrack = function(track) {
            return this.auth().then(function(user) {
                track.added_on = Firebase.ServerValue.TIMESTAMP;
                track.added_by = user.auth.uid;
                track.votes    = [];

                var ref = obj.fb.tracks.push(track);

                return {
                    key: ref.key()
                };
            });
        };

        this.addVote = function(item_id) {
            this.auth().then(function(user) {
                user.added_on = Firebase.ServerValue.TIMESTAMP;
                obj.fb.tracks.child(item_id).child('votes').push(user);
            });
        };

        this.formatTrackData = function(item_id, item) {
            item.id = item_id;

            var votes = [];
            var voteDates = [];

            if (item.votes) {
                for (var vote in item.votes) {
                    voteDates.push(item.votes[vote].added_on);
                    votes.push(item.votes[vote]);
                }
            }

            item.last_vote = _.max(voteDates) || 0;
            item.votes     = votes;

            this.getUser(item.added_by).then(function(userData) {
                item.added_by = userData;

                if (_.find(item.votes, { id: userData.id }, 'id')) {
                    item.voted = true;
                } else {
                    item.voted = false;
                }
            });

            item.added_on_relative  = moment(item.added_on, 'x').fromNow();
            item.added_on_formatted = moment(item.added_on, 'x').format('MMMM Do YYYY, h:mm:ss a');

            return item;
        };

        this.listenFor = {
            newTracks: function(callback) {
                obj.fb.tracks.on('child_added', function(snapshot) {
                    callback(obj.formatTrackData(snapshot.key(), snapshot.val()));
                });
            },
            updatedTracks: function(callback) {
                obj.fb.tracks.on('child_changed', function(snapshot) {
                    callback(obj.formatTrackData(snapshot.key(), snapshot.val()));
                });
            }
        };

        this.getTrackByTitleAndArtist = function(title_artist) {
            var deferred = $q.defer();

            this.fb.tracks.once('value', function(snapshot) {
                _.each(snapshot.val(), function(item, key) {
                    if (item.artist + ' - ' + item.title === title_artist) {
                        deferred.resolve(obj.formatTrackData(key, item));
                        return;
                    }
                });
            });

            return deferred.promise;
        };

    }]);

}
