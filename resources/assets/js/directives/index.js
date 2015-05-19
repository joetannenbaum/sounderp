'use strict'

module.exports = function(app) {
    require('./search-pane.js')(app);
    require('./player.js')(app);
};
