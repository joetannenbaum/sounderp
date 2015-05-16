var sounderp = angular.module('Sounderp', ['spotify', 'ngAudio']);

require('./providers')(sounderp);
require('./controllers')(sounderp);
