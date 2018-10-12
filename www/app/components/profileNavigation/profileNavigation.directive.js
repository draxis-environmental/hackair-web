(function(){
  'use strict';

  angular.module('app.components')
  .directive('profileNavigation', profileNavigation);

  function profileNavigation(){
      var directive = {
          restrict: 'E',
          replace: 'true',
          templateUrl: 'app/components/profileNavigation/profileNavigation.html'
      };

      return directive;
  }
})();
