(function() {
  'use strict';

  angular.module('app.layout', [
    'app.core',
    'app.landing',
    'app.home',
    'app.profile',
    'app.mission',
    'app.chartCompare',
    'app.components',
    'app.sensors',
    'app.social'
  ])
  .directive('layout', layout);

  function layout(){
    return {
      restrict: 'E',
      templateUrl: 'app/layout/layout.html'
    }
  }

})();
