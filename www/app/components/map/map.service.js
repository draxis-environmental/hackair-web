(function(){
    'use strict';

    angular.module('app.components')
    .factory('MapService', MapService);

    MapService.$inject = ['$http','API_URL'];

    function MapService($http, API_URL){
        var service = {
            getMeasurements: getMeasurements,
            getWMS: getWMS,
            getMyMeasurements: getMyMeasurements,
            getPerceptions: getPerceptions
        };

        return service;

        function getMeasurements(location){

          var oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);

          var twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            return $http.get(API_URL + '/measurements', {
                params: {
                    timestampStart: twoDaysAgo.toISOString(), 
                    location: locationToString(location),
                    show: 'latest'
                }
            })
            .then(function(response){
                return response.data.data;
            });
        }

        function getPerceptions(){

          return $http.get(API_URL + '/perceptions')
          .then(function(response){
            return response.data.data;
          });
        }

        function getMyMeasurements(location, userId){

          var oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 14);

          var twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

          return $http.get(API_URL + '/measurements', {
             params: {
              timestampStart: twoDaysAgo.toISOString(),
              location: locationToString(location),
              user: userId,
              show: 'latest'
            }
          })
          .then(function(response){
            return response.data.data;
          });
        }

        function locationToString(location){
            var arr = location.split(',');
            var str = [arr[0],arr[1]].join(',') + '|' + [arr[2],arr[3]].join(',');

            return str;
        }

        function getWMS(options){
            return $http.get(API_URL + '/') // @maria diko sou
        }

        // Date helper
        function yesterday(){
            var d = new Date();
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setDate(d.getDate() -1 );

            return d;
        }

        function halfHourBefore(){
            var d = new Date();
            d.setHours(d.getHours() - 2);
            return new Date(d.getTime() - (60*1000*30));
        }
    }
})();
