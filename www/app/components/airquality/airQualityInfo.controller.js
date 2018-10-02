(function () {
  'use strict';

  angular
    .module('app.components')
    .controller('AirQualityInfoController', AirQualityInfoController);

  /* @ngInject */
  function AirQualityInfoController($uibModal, $scope, $rootScope, $http, API_URL, $localStorage) {
    var vm = this;

    var active;
    var texts = {}

    $scope.isObjectEmpty = function (obj) {
      return Object.keys(obj).length;
    }

    activate();

    function activate() {

      var currentLanguage = $localStorage.currentLanguage;
      if (currentLanguage == 'no') {
        currentLanguage = 'nb'
      } // 'no' is not available in moment lib, so we use an alternative norwish language

      angular.extend(vm, {
        image: 'img/airquality/' + vm.quality + '.png',
        isActive: isActive,
        setActive: setActive,
        share: share,
        showHistory: showHistory,
        selectedCity: $rootScope.selectedCity,
        getAq: getAq,
        hidePopover: hidePopover,
        currentTime: moment().locale(currentLanguage).format('MMM Do, HH:mm')
      });
      vm.texts = texts;

      $scope.$on('selectedCity', function (event, city) {
        vm.selectedCity = city;

        if (city.coords.latitude) {
          vm.selectedCity.coords[0] = city.coords.latitude;
          vm.selectedCity.coords[1] = city.coords.longitude;
        }

        getAq();
      });
    }

    function isActive(activity) {
      return activity == active;
    }

    function hidePopover() {
      $("[data-toggle='popover']").popover('hide');
    }

    function setActive(activity, isSecondary, popover) {
      active = activity;
      if (!isSecondary) {
        if (vm.texts[activity].indexOf('-') > -1)
          vm.quote = vm.texts[activity].substr(0, vm.texts[activity].indexOf('-')); //gia na deiksei mono to keimeno, xoris ta -bad ktl
        else
          vm.quote = vm.texts[activity];
      } else {
        if (vm.textsSecondary[activity].indexOf('-') > -1)
          vm.quote = vm.textsSecondary[activity].substr(0, vm.textsSecondary[activity].indexOf('-')); //gia na deiksei mono to keimeno, xoris ta -bad ktl
        else
          vm.quote = vm.textsSecondary[activity];
      }
      setTimeout(() => {
        $(`#${popover}`).popover('show');
      }, 200);
    }

    function getText(activity) {

    }

    function share() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/components/airquality/share.html',
        scope: $scope,
        controller: function ($uibModalInstance, $scope) {
          var href = "https://platform.hackair.eu/locations/" + vm.selectedCity.name;
          var quote = "The air quality in " + vm.selectedCity.name + " is " + vm.quality + "!";
          angular.extend($scope, {
            href: href,
            quote: quote
          });

          $scope.shareFb = function () {
            FB.ui({
              method: 'share',
              href: href,
              quote: quote
            }, function (response) {
              // console.log(response);
            });
          };

          $scope.ok = function () {
            $scope.$dismiss();
          }
        },
        size: 'sm'
      });
    }

    function showHistory() {

    }

    function getAq() {
      vm.unsupported = false;

      $http.get(API_URL + '/aq', {
        headers: {
          Accept: 'application/vnd.hackair.v1+json'
        },
        params: {
          lat: vm.selectedCity.coords[0],
          lon: vm.selectedCity.coords[1]
        }
      }).then(function (response) {

        var aqi = response.data.data[0].AQI_Index;

        if (aqi === 'perfect') {
          aqi = 'very_good';
        }

        vm.quality = aqi;
        vm.image = 'img/airquality/' + vm.quality + '.png';

        vm.showRecommendations = true;

        if ($localStorage.user != undefined) {
          vm.showRecommendations = true;
          getRecommendations(); // ^^
        }

        // vm.setActive('running');

      }).catch(function (response) {
        vm.quality = undefined;
        vm.unsupported = true;
        vm.image = null;
        vm.showRecommendations = null;
      });
    }

    function getRecommendations() {
      $http.get(API_URL + '/users/recommendations', {
          params: {
            city: vm.selectedCity.name,
            lat: vm.selectedCity.coords[0],
            lon: vm.selectedCity.coords[1]
          }
        })
        .then(function (response) {

          var recommendations = response.data.data.results[0].directUser ? response.data.data.results[0] : response.data.data.results[1];
          var recommendationsSecondary = response.data.data.results[0].directUser ? response.data.data.results[1] : response.data.data.results[0];

          vm.texts = recommendations.isProvidedWithRecommendation.LimitExposureRecommendation;
          if (recommendationsSecondary) {
            vm.textsSecondary = recommendationsSecondary.isProvidedWithRecommendation.LimitExposureRecommendation;
          }
          $("[data-toggle='popover']").popover({
            container: 'body',
          });
        });
    }


  }
})();
