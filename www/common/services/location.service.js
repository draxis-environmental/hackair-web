(function(){
    'use strict';

    angular.module('app.services')
    .factory('LocationService', LocationService);

    LocationService.$inject = ['$q', '$localStorage', '$rootScope'];

    function LocationService($q, $localStorage, $rootScope){
        var service = {
            geocodeCity: geocodeCity,
            getCity: getCityCoords
        };

        return service;

        function getCityCoords(location){
          var address = location.formatted_address;

          return geocodeCity(address).then(function(coords){

            return {
              city: address,
              coords: coords
            }

          })
        }

        function geocodeCity(address){
          var deferred = $q.defer();
          var geocoder = new google.maps.Geocoder();


          geocoder.geocode({address:address}, function(data, status){
            if (status == google.maps.GeocoderStatus.OK) {
              if (data[0] != null){
                var coords= {latitude: data[0].geometry.location.lat(), longitude:data[0].geometry.location.lng()};
                $rootScope.cityLoc = {
                  city: address,
                  coords: coords
                };
                deferred.resolve(coords); // Not sure about the first key, needs testing;

              } else {
                deferred.reject('No coords found');
              }
            } else {
                deferred.reject('Geocoder error');
            }
          });

          return deferred.promise;
        }

    }
})();
