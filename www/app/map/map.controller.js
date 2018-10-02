(function () {
  'use strict';

  angular
    .module('app.map')
    .controller('MapController', MapController);

  MapController.$inject = ['MapService', '$scope', 'API_URL', '$filter'];
  /* @ngInject */
  function MapController(MapService, $scope, API_URL, $filter) {
    var vm = this;

    console.log('111');

    activate();

    function activate() {
      LocationService.getLocation().then(renderMap).catch(renderMap);

      $scope.$on('toggleLayer', function (event, layer) {
        toggleLayer(layer);
      });
    }

    function renderMap(location) {
      // Map configuration
      // var center = L.latLng(40.38002840251183,-2.92236328125); // Iberia
      var center = L.latLng(40.63, 22.949); // Thessaloniki
      if (!location) {} else {
        // var center = L.latLng(location.coords.latitude, location.coords.longitude);
      }

      var map = L.map('map', {
        // crs: L.CRS.EPSG4326, // Depends on WMS server, default is EPSG3857. Example WMSLayer uses EPSG4326
        center: center,
        zoom: 5,
        zoomControl: false
      });
      // Create controls
      L.Control.layerPicker = L.Control.extend({
        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'map-layer-picker');
          var header = L.DomUtil.create('div', 'header', container);

          L.DomEvent.on(header, 'click', function () {
            var open = L.DomUtil.hasClass(container, 'open');
            if (open) {
              L.DomUtil.removeClass(container, 'open');
            } else {
              L.DomUtil.addClass(container, 'open');
            }
          });

          var icon = L.DomUtil.create('div', 'icon', header);
          var title = L.DomUtil.create('div', 'title', header);
          title.innerText = 'Map filter';
          var filtersContainer = L.DomUtil.create('div', 'filters', container);

          var filters = [{
              label: $filter('translate')('filters.fusion'),
              class: 'fusion active',
            },
            {
              label: $filter('translate')('filters.luftdaten'), // NEW LUFTDATEN
              class: 'luftdaten active',
            },
            {
              label: $filter('translate')('filters.cots'), // NEW FILTER FOR COTS MEASUREMENTS (MAKIS)
              class: 'cots active',
            },
            {
              label: $filter('translate')('filters.sensors'),
              class: 'sensors active'
            }, {
              label: $filter('translate')('filters.photos'),
              class: 'photos'
            }, {
              label: $filter('translate')('filters.open_data'),
              class: 'open-data'
            }, {
              label: $filter('translate')('filters.perceptions'),
              class: 'perceptions'
            }, {
              label: $filter('translate')('filters.my_sensors'),
              class: 'my-sensors'
            }, {
              label: $filter('translate')('filters.my_photos'),
              class: 'my-photos'
            }
          ];

          filters.forEach(function (filter) {
            var filterContainer = L.DomUtil.create('div', 'filter ' + filter.class, filtersContainer);
            L.DomUtil.create('div', 'icon', filterContainer);
            L.DomUtil.create('span', 'label', filterContainer).innerText = filter.label;
            var checker = L.DomUtil.create('span', 'checker active', filterContainer);
            L.DomUtil.create('i', 'ion-checkmark', checker);

            L.DomEvent.on(filterContainer, 'click', function () {
              var hasClass = L.DomUtil.hasClass(this, 'active');

              if (hasClass) {
                L.DomUtil.removeClass(filterContainer, 'active');
              } else {
                L.DomUtil.addClass(filterContainer, 'active');
              }

              $scope.$emit('toggleLayer', filter.class.split(' ')[0]);
            })
          })


          return container;
        },
        onRemove: function (map) {
          //
        }
      });


      vm.layerPicker = new L.Control.layerPicker({
        position: 'topright'
      }).addTo(map);



      // Create map layers
      var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      var wmsLayer = L.tileLayer.wms(API_URL + '/map?', { // my local IP, mapped to mapserver container
          layers: 'hackair',
          format: 'image/png',
          transparent: 'true',
          crs: L.CRS.EPSG4326, // Depends on WMS server, default is EPSG3857. Example WMSLayer uses EPSG4326
          opacity: 0.5
        })
        .addTo(map);
      var measurementsLayer = L.featureGroup().addTo(map);

      // Attach them all to the vm
      angular.extend(vm, {
        map: map,
        layers: {
          tileLayer: tileLayer,
          fusion: wmsLayer,
          sensors: measurementsLayer
        }
      });

      var boundBox = map.getBounds().toBBoxString();
      MapService.getMeasurements('-20,30,45,60')
        .then(function (measurements) {
          // Add measurement markers to featureLayer
          var markers = filterMeasurements(measurements);
          addMarkersToMap(markers);
          console.log(markers);
        })
        .catch(function (err) {
          console.log(err);
        });

    }
    // Create Icons
    var cotsIcon = L.icon({ // NEW COTS ICON (MAKIS)
      iconUrl: '/img/icons/icon_square_edit.svg', // NEW COTS ICON (MAKIS)
      iconSize: [24, 36], // NEW COTS ICON (MAKIS)
      iconAnchor: [12.5, 36], // NEW COTS ICON (MAKIS)
      popupAnchor: [0, -35], // NEW COTS ICON (MAKIS)
    });

    var sensorIcon = L.icon({
      iconUrl: 'img/icons/u_i_pin_sensor.svg',
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35],
    });

    function toggleLayer(layer) {
      if (vm.layers[layer] == undefined) {
        return;
      }

      if (vm.map.hasLayer(vm.layers[layer])) {
        vm.map.removeLayer(vm.layers[layer]);
      } else {
        vm.map.addLayer(vm.layers[layer]);
      }
    }

    function filterMeasurements(measurements) {
      var unique = {};
      var distinct = [];

      measurements.forEach(function (m) {
        var key = m.source_info.sensor.id;
        if (typeof (unique[key] == "undefined")) {
          unique[key] = m;
        }

        if (unique[key].datetime < m.datetime) {
          unique[key] = m;
        }
      });

      for (var i in unique) {
        distinct.push(unique[i]);
      }
      return distinct;
    }

    function addMarkersToMap(markers) {

      markers.forEach(function (m) {
        var popup = createPopup(m)
        var marker = L.marker([m.loc.coordinates[1], m.loc.coordinates[0]], {
          icon: sensorIcon,
          title: m.pollutant_i.index
        });
        marker.bindPopup(popup);
        marker.addTo(vm.layers.sensors);

      })
    }

    function createPopup(measurement) {

      var popup = L.DomUtil.create('div', 'measurement-popup');
      var time = new Date(measurement.date_str);
      L.DomUtil.create('div', 'img-sensor ' + measurement.source_type, popup);
      L.DomUtil.create('h3', '', popup).innerText = measurement.source_info.user.username || '';
      var timeContainer = L.DomUtil.create('div', 'time-container', popup);
      L.DomUtil.create('span', '', timeContainer).innerText = time.toDateString() + ' @ ';
      L.DomUtil.create('span', '', timeContainer).innerText = time.getHours() + ':' + time.getMinutes();
      L.DomUtil.create('h2', '', popup).innerText = $filter('translate')('air_quality.air_quality_is') + measurement.pollutant_i.index;

      return popup;
    }
  }
})();


// Sensors
// · Username
// · Type (Arduino or PSoC)
// · Date & time of the most recent measurement
// · AQ scale for the most recent measurement (bad, good, etc.) both PM2,5 and PM10
// · Value of the most recent measurement (e.g. PM10=…)
