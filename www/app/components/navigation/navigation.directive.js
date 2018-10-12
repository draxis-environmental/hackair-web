(function(){
    angular.module('app.components')
    .directive('landingNavigation', landingNavigation)
    .directive('navigation', navigation);

    function landingNavigation(){
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/components/navigation/landing-navigation.html',
            controller: 'ComponentsController',
            controllerAs: 'vm',
            bindToController: true,
            link: function(){

            }
        }
    }

    function navigation(){
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/components/navigation/navigation.html',
            link: function(){

            }
        }
    }
})();
