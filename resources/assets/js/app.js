var sounderp = angular.module('Sounderp', ['spotify', 'ngAudio', 'templates', 'ngCookies']);

angular.module('templates', []);

require('./providers')(sounderp);
require('./controllers')(sounderp);
require('./directives')(sounderp);
