(function(){
    angular.module('app.components')

    .directive('notification', notification);

    function notification(){
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/notificationCard/notification.html',
            scope: {
            },
            link: link,
            controller: 'NotificationController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {

        }
    }
})();
