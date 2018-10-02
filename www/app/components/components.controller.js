(function() {
    'use strict';

    angular
    .module('app.components')
    .controller('ComponentsController', ComponentsController);

    ComponentsController.$inject = ['$scope', '$rootScope', '$localStorage', '$window'];
    /* @ngInject */
    function ComponentsController($scope, $rootScope, $localStorage, $window) {
        var vm = this;

        activate();

        function activate(){
            angular.extend(vm, {
                language: $localStorage.currentLanguage || 'en',
                changeLanguage: changeLanguage,
                locationChanged: locationChanged
            });
        }

        function changeLanguage(language) {
            vm.language =  $localStorage.currentLanguage = language;
            $window.location.reload();
        }

        function locationChanged(location){
          
        }

    }
})();
