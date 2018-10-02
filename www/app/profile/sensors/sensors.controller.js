(function () {
  'use strict';

  angular
    .module('app.sensors')
    .controller('SensorsController', SensorsController);

  SensorsController.$inject = ['geolocation', 'ngToast', 'API_URL', '$window', '$state', '$scope', '$rootScope', '$localStorage', 'DataService', '$http', '$filter', '$stateParams', '$uibModal'];
  /* @ngInject */
  function SensorsController(geolocation, ngToast, API_URL, $window, $state, $scope, $rootScope, $localStorage, DataService, $http, $filter, $stateParams, $uibModal) {
    var vm = this;

    vm.timeZoneOffset = new Date().getTimezoneOffset() / (-60);

    if ($rootScope.gpsLocation == undefined) {
      geolocation.getLocation().then(function (data) {
        $rootScope.gpsLocation = {
          lat: data.coords.latitude,
          long: data.coords.longitude
        };
      });
    }

    $scope.selectedSensor;
    $scope.selectedLocationType;

    $scope.HsensorId = $stateParams.sensorId;

    $scope.dateFrom;
    $scope.dateTo;

    $scope.validateTimeDifference = function () {

      console.log($scope.dateFrom, $scope.dateTo);

      //Get 1 day in milliseconds
      var one_day = 1000 * 60 * 60 * 24;

      // Convert both dates to milliseconds
      var date1_ms = $scope.dateFrom.getTime();
      var date2_ms = $scope.dateTo.getTime();

      // Calculate the difference in milliseconds
      var difference_ms = date2_ms - date1_ms;

      // Convert back to days and return
      var dayDifference = Math.round(difference_ms / one_day);
      console.log(dayDifference);

      if ($scope.dateTo <= $scope.dateFrom) {
        ngToast.create({
          className: 'warning',
          content: 'End date must be a later date than start date' //$filter('translate')('')
        });
      } else if (dayDifference < 32) {
        var fromT = $scope.dateFrom.toISOString();
        var toT = $scope.dateTo.toISOString();
        console.log('show excel button');
        var excelUrl = API_URL + '/measurements/export' + '?sensor_id=' + $stateParams.sensorId + '&start=' + fromT + '&end=' + toT;
        console.log(excelUrl);
        $window.open(excelUrl, '_blank');
      } else {
        ngToast.create({
          className: 'warning',
          content: 'Date range must be maximum 30 days'
        });
      }

    }

    activate();

    function activate() {
      angular.extend(vm, {
        editSensor: editSensor,
        deleteSensor: deleteSensor,
        returnToSensor: returnToSensor,
        updateSensor: updateSensor,
        openMapPopup: openMapPopup,
        exportExcel: exportExcel
      });

      switch ($state.current.name) {
        case 'profile.sensors':
          getSensors();
          break;
        case 'profile.add-sensor':
          initSensorViewModel();
          // console.log('route = profile.add-sensor');
          break;
        case 'profile.view-sensor':
          getSensor($stateParams.sensorId, true);
          break;
        case 'profile.edit-sensor':
          getSensor($stateParams.sensorId);
          // fillOptions();
          break;
        default:
          break;
      }

    }

    function dataTable() {
      $('#example').DataTable({
        // "bProcessing": true,
        // "processing": true,
        "serverSide": true,
        // "bPaginate": true,
        "searching": false,
        "dom": "<lf<t><'row'<'col-sm-12 text-center'i><'col-sm-12 text-center'p>>>",
        // "sPaginationType": "full_numbers", // And its type.
        // "iDisplayLength": 10,
        "ajax": {
          url: `${API_URL}/measurements?lang=en&sensor=${$stateParams.sensorId}&show=all&timestampStart=1970-01-01T00:00:00.000Z`,
          beforeSend: function (request) {
            request.setRequestHeader("authorization", 'Bearer ' + $localStorage.credentials);
          }
        },
        "initComplete": function (settings, json) {
          $('div#card-table').show();
        },
        "columns": [{
            "data": res => {
              return moment(res.date_str).format('YYYY/MM/DD @ HH:mm');
            }
          },
          {
            "data": res => {
              return res.pollutant_i.name.split('_')[0];
            }
          },
          {
            "data": res => {
              return res.pollutant_q.value + res.pollutant_q.unit;
            }
          },
          {
            "data": res => {
              return $filter('translate')(`profile.photos.${res.pollutant_i.index}`);
            }
          },
        ]
      });
    }

    function getSensors() {
      DataService.Sensors.get('', {
          user_id: $localStorage.user.id
        })
        .then(function (res) {
          vm.sensors = res.data;
          vm.sensors.map(function (sensor) {
            // sensor.fromNow = moment(sensor.created_at).fromNow();
            if (sensor.last_measurement_at) {
              sensor.fromNow = moment(sensor.last_measurement_at).format('DD-MM-YYYY HH:mm');
            } else {
              sensor.fromNow = '-';
            }
          });

          renderSensorsMap();

        });
    }

    function renderSensorsMap() {
      var center = L.latLng(40.63, 22.949); // Thessaloniki

      var map = L.map('map', {
        center: center,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });
      var tileLayer = L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);
      var sensorLayer = L.featureGroup().addTo(map);

      vm.sensors.forEach(function (sensor) {
        if (sensor.location.geometry != undefined) {
          var s = L.marker().setLatLng(sensor.location.geometry.coordinates.reverse());
          var popup = createSensorPopup(sensor);
          s.bindPopup(popup);
          s.addTo(sensorLayer);
        }
      });

      map.fitBounds(sensorLayer.getBounds());
    }

    function renderSensorMap() {
      var center = L.latLng(40.63, 22.949); // Thessaloniki

      var map = L.map('map', {
        center: center,
        zoom: 15,
        // zoomControl: false,
        attributionControl: false
      });
      var tileLayer = L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);
      var sensorLayer = L.featureGroup().addTo(map);
      var sensor = vm.sensor;

      if (sensor.location.geometry != undefined) {
        var s = L.marker().setLatLng(sensor.location.geometry.coordinates.reverse());
        var popup = createSensorPopup(sensor);
        s.bindPopup(popup);
        s.addTo(sensorLayer);
      }

      map.fitBounds(sensorLayer.getBounds());
    }

    function createSensorPopup(sensor) {

      var popup = L.DomUtil.create('div', 'sensor-box text-center');
      var img = L.DomUtil.create('img', popup);
      img.src = "/img/temp/sensor2.png";
      L.DomUtil.create('h5', '', popup).innerText = sensor.name || '';
      L.DomUtil.create('h6', '', popup).innerText = sensor.location.properties.label || '';
      L.DomUtil.create('h6', '', popup).innerText = sensor.type || '';

      return popup;
    }
    // function buildPopup(sensor){

    //       <div class="col-xs-6 col-sm-4 col-sm-offset-1 sensor-box text-center">
    //         <img src="../../../img/temp/sensor_2.png">
    //         <h5>{{vm.sensor.name}}</h5>
    //         <h6><img src="../../../img/icons/icon_small_pin_inactive.svg">{{vm.sensor.location.properties.label}}</h6>
    //         <h6><img src="../../img/icons/icon_small_sensor_inactive.svg"> {{vm.sensor.type}}</h6>
    //       </div>
    // }

    function getSensor(id) {
      DataService.Sensors
        .one(id).get()
        .then(function (res) {
          vm.sensor = res.data;

          if ($state.current.name === 'profile.edit-sensor') {
            fillOptions();
          }


          if ($state.current.name === 'profile.view-sensor' && vm.sensor.type !== 'bleair') {
            renderSensorMap();
          }
          if ($state.current.name === 'profile.view-sensor') {
            dataTable();
          } else {
            DataService.Measurements
              .get('', {
                sensor: id,
                timestampStart: new Date(0),
                show: 'all'
              })
              .then(function (result) {
                vm.sensor.measurements = result.data;
              });
          }

        });
    }

    function initSensorViewModel() {
      vm.sensor = {

      };

      vm.locations = [
        $filter('translate')('none'),
        $filter('translate')('indoor'),
        $filter('translate')('building_entrance'),
        $filter('translate')('garden'),
        $filter('translate')('terrace'),
        $filter('translate')('balcony'),
        $filter('translate')('street'),
        $filter('translate')('other_outdoor'),
      ];

      vm.types = [{
          id: 1,
          name: $filter('translate')('hackair.hackair_home'),
          value: $filter('translate')('arduino'),
          selected: false
        },
        {
          id: 2,
          name: $filter('translate')('hackair.hackair_mobile'),
          value: $filter('translate')('bleair'),
          selected: false
        }
      ];

      vm.getOptionsSelected = getOptionsSelected;
      vm.createSensor = createSensor;
    }

    function deleteSensor() {
      console.log($stateParams.sensorId);
      DataService.Sensor.delete($stateParams.sensorId)
        .then(function (response) {
          console.log(response);
          $state.go('profile.sensors');
        })
        .catch(function (response) {
          console.error(response);
        })
    }

    function editSensor() {
      // vm.getOptionsSelected = getOptionsSelected;
      $state.go('profile.edit-sensor', {
        sensorId: $stateParams.sensorId
      });
    }

    function returnToSensor() {
      $state.go('profile.view-sensor', {
        sensorId: $stateParams.sensorId
      });
    }

    function fillOptions() {

      vm.locations = [
        $filter('translate')('none'),
        $filter('translate')('indoor'),
        $filter('translate')('building_entrance'),
        $filter('translate')('garden'),
        $filter('translate')('terrace'),
        $filter('translate')('balcony'),
        $filter('translate')('street'),
        $filter('translate')('other_outdoor'),
      ];

      vm.types = [{
          id: 1,
          name: $filter('translate')('hackair.hackair_home'),
          value: $filter('translate')('arduino'),
          selected: false
        },
        {
          id: 2,
          name: $filter('translate')('hackair.hackair_mobile'),
          value: $filter('translate')('bleair'),
          selected: false
        }
      ];

      console.log(vm.sensor);
      if (vm.sensor.type === 'arduino') {
        $scope.selectedSensor = vm.types[0];
      }
      if (vm.sensor.type === 'bleair') {
        $scope.selectedSensor = vm.types[1];
      }
    }

    function updateSensor() {
      //todo: update sensor details

      var sensor = DataService.Sensors.one(vm.sensor.id);

      angular.extend(sensor, {
        name: vm.sensor.name,
        loc: vm.sensor.location,
        location: vm.sensor.location,
        // location_type: $scope.selectedLocationType,
        location_type: vm.sensor.location_type,
        type: $scope.selectedSensor.value,
        user_id: $localStorage.user.id,
        floor: vm.sensor.floor
      });

      sensor.put().then(function (response) {
        vm.sensor = response.data;
        returnToSensor();
      });
    }

    function createSensor() {
      var sensor = {
        name: vm.sensor.name,
        loc: vm.sensor.location,
        location: vm.sensor.location,
        // location_type: $scope.selectedLocationType,
        location_type: vm.sensor.location_type,
        type: $scope.selectedSensor.value,
        floor: vm.sensor.floor
      };

      console.log(sensor);

      if (vm.sensor.floor < 0) {
        vm.negativeFloor = true;
      } else {
        DataService.Sensors
          .post(sensor)
          .then(function (response) {
            $state.go('profile.view-sensor', {
              sensorId: response.resources.id
            });
          })
          .catch(function (response) {
            console.error(response);
          })
      }
    }

    function getOptionsSelected(options, valueProperty, selectedProperty) {

      var optionsSelected = $filter('filter')(options, function (option) {
        return option[selectedProperty] == true;
      });
      return optionsSelected.map(function (group) {
        return group[valueProperty];
      }).join(", ");
    }

    function exportExcel() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/profile/sensors/export-excel.html',
        controller: 'SensorsController',
        controllerAs: 'vm',
        size: 'md'
      })
      modalInstance.result.then(function () {});
    }

    function openMapPopup() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/profile/sensors/map-popup.html',
        controller: function (geolocation, $uibModalInstance, $scope, $timeout) {
          var vm = this;

          vm.sensorAddress;

          $scope.$on('sensorAddressChanged', function (event, location) {
            console.log(location.coords);
            moveMapTo(location.coords);
          });

          function moveMapTo(location) {
            vm.map.whenReady(function () {
              console.log('moving sensor popup map to input address');
              vm.map.panTo([location.latitude, location.longitude]);
            });
          }

          vm.locationChanged = function () {};

          activate();

          function activate() {
            vm.save = save;
            vm.loc = {};
            $timeout(renderMap, 100);
          }

          function renderMap() {

            if ($rootScope.gpsLocation) {
              console.log($rootScope.gpsLocation);
              var center = L.latLng($rootScope.gpsLocation.lat, $rootScope.gpsLocation.long);
            } else {
              // if user does not allow browser's location then we use user's saved location
              var profile = angular.copy($localStorage.user);
              var center = L.latLng(profile.location.coordinates[1], profile.location.coordinates[0]);
            }

            // var center = L.latLng(40.63,22.949);  // Thessaloniki

            var map = L.map('map', {
              // crs: L.CRS.EPSG4326, // Depends on WMS server, default is EPSG3857. Example WMSLayer uses EPSG4326
              center: center,
              zoom: 15,
              // zoomControl: false,
              attributionControl: false
            });

            angular.extend(vm, {
              map: map,
            });

            var tileLayer = L.tileLayer('http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);
            var geocoder = new google.maps.Geocoder;


            var locationLayer = L.featureGroup().addTo(map);
            var clickedPoint = L.marker();

            map.on('click', function (e) {
              var label = L.latLng(e.latlng).toString();


              geocoder.geocode({
                'location': e.latlng
              }, function (results, status) {
                if (status === 'OK') {
                  if (results[0]) {
                    label = results[0].formatted_address
                    clickedPoint.removeFrom(map);
                    clickedPoint.setLatLng(e.latlng);
                    clickedPoint.bindPopup(label);
                    clickedPoint.addTo(map);
                    clickedPoint.openPopup();
                    vm.loc = clickedPoint.toGeoJSON();
                    vm.loc.properties.label = label;
                    if (results[1]) {
                      vm.loc.properties.label_short = results[1].formatted_address;
                    }

                  } else {
                    vm.loc.properties.label = label;
                    console.error('No results found');
                  }
                } else {
                  window.alert('Geocoder failed due to: ' + status);
                }
              });
            })
          }

          function save() {
            $uibModalInstance.close(vm.loc);
          }
        },
        controllerAs: 'vm',
        size: 'lg'
      })
      modalInstance.result.then(function (feature) {
        vm.sensor.location = feature;
      });
    }

  }
})();
