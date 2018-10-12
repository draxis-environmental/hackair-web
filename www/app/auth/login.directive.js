(function(){
    angular.module('app.auth')
    .directive('login', login);

    function login(){

         var directive = {
            restrict: 'E',
            templateUrl: 'app/auth/login.html',
            replace: true,
            scope: {
            },
            link: link,
            controller: 'AuthController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {
            
        }
    }
})();