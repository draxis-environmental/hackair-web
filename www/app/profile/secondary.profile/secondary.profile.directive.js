(function(){
  'use strict';

  angular.module('app.profile')
  .directive('secondaryProfile', secondaryProfile);

  function secondaryProfile(){
      var directive = {
          restrict: 'E',
          replace: 'true',
          templateUrl: 'app/profile/secondary.profile/secondary.profile.html'
      };

      return directive;
  }
})();
