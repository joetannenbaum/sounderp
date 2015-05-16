'use strict'

module.exports = function(app) {
    require('./auth')(app);
    require('./soundcloud')(app);
    require('./spotify')(app);
    require('./youtube')(app);
    require('./firebase')(app);
    require('./server')(app);
}
