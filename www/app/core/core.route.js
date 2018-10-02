(function() {
  'use strict';

  angular
    .module('app.core')
    .run(appRun);

  /* @ngInject */
  function appRun(geolocation, routerHelper, $rootScope, $translate, tmhDynamicLocale, availableLanguages, defaultLanguage, $localStorage, $state) {

    // geolocation.getLocation().then(function(data){
    //   $rootScope.gpsLocation = {lat:data.coords.latitude, long:data.coords.longitude}; 
    //   console.log($rootScope.gpsLocation);
    // })

    var otherwise = '/';
    routerHelper.configureStates(getStates(), otherwise);

      checkIfLoggedIn();
      setLanguage();

      // Attach current route to rootScope
      $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {

      });

    function setLanguage(){
      if ($localStorage.currentLanguage == undefined){
        $localStorage.currentLanguage = 'en';
      }

      applyLanguage($localStorage.currentLanguage);
      $translate.use($localStorage.currentLanguage);
      // if (typeof(navigator.globalization) !== 'undefined') {
      //   $cordovaGlobalization.getPreferredLanguage().then(function (result){
      //     var language = getSuitableLanguage(result.value);
      //     applyLanguage(language);
      //     $translate.use($localStorage.currentLanguage);
      //   })
      // } else {
      //   applyLanguage(defaultLanguage);
      // }
    }

    function applyLanguage(language){
      tmhDynamicLocale.set(language.toLowerCase());
    }

    function getSuitableLanguage(language){
      for (var i=0; i< availableLanguages.length; i++) {
        if (availableLanguages[i].toLowerCase() === language.toLowerCase()) {
          return availableLanguages[i];
        }
      }
      return defaultLanguage;
    }

    function checkIfLoggedIn(){
      if ($localStorage.user){
        $rootScope.user = $localStorage.user;
        $rootScope.loggedIn = true;
      }
    }
  }

  function getStates() {
    return [
      {
        state: 'main',
        config : {
          url:'/',
          template: '',
          controller: function($rootScope, $state){
            if ($rootScope.loggedIn){
              $state.go('home')
            } else {
              $state.go('about')
            }
          }
        }
      },
      {
        state: '404',
        config: {
          url: '/404',
          templateUrl: 'app/core/404.html',
          title: '404'
        }
      }
    ];
  }

})();
