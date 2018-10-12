(function(){
    'use strict';

    angular.module('app.components')
    .directive('footerSection', footerSection);
    
    function footerSection(){
        var directive = {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'app/components/footer/footer.html'
        };

        return directive;
    }
})();