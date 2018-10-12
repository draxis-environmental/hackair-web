(function() 
{
  'use strict';

  angular
    .module('app.chartCompare')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() 
    {
        return [
            {
                state: 'chartCompare',
                config: 
                    {
                    url: '/chartCompare?city1&city2',
                    templateUrl: 'app/components/chartCompare/chartCompareView.html',
                    controller: 'chartCompareController',
                    controllerAs: 'vm'
                    }
            }
        ];

    }

})();

