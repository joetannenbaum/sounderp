'use strict'

module.exports = function(app) {
    require('./search-pane.js')(app);
    require('./player.js')(app);
    require('./online-users.js')(app);
    require('./playlist.js')(app);
    require('./playlist-actions.js')(app);
};
