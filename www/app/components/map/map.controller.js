(function() {
  "use strict";

  angular.module("app.components").controller("MapController", MapController);

  MapController.$inject = [
    "$translate",
    "MapService",
    "$scope",
    "$rootScope",
    "$compile",
    "$http",
    "$timeout",
    "$localStorage",
    "API_URL",
    "$uibModal",
    "$filter"
  ];
  /* @ngInject */
  function MapController(
    $translate,
    MapService,
    $scope,
    $rootScope,
    $compile,
    $http,
    $timeout,
    $localStorage,
    API_URL,
    $uibModal,
    $filter
  ) {
    var vm = this;

    $scope.$on("selectedHomeMapCity", function(event, location) {
      moveMapTo(location.coords);
    });

    function moveMapTo(location) {
      vm.map.whenReady(function() {
        vm.map.panTo([location.latitude, location.longitude]);
      });
    }

    vm.timeZone = moment.tz.guess();

    vm.timeZoneOffset = new Date().getTimezoneOffset() / -60;

    vm.currentLanguage = $localStorage.currentLanguage;
    if (vm.currentLanguage == "no") {
      vm.currentLanguage = "nb";
    } // 'no' doesnt exist in momentjs lib, so replace it with alternative available norsk language

    activate();

    function activate() {
      vm.loading = false;

      $scope.$on("toggleLayer", function(event, layer) {
        toggleLayer(layer);
      });

      $scope.$on("selectedCity", function(event, city) {
        vm.map.panTo(city.coords);
        vm.selectedCity = city;

        getData();
      });

      $scope.$on("removeMainCitySelect", function(event) {
        if (vm.citySearch != undefined) {
          vm.citySearch.remove();
          L.DomUtil.remove(vm.citySearch);
          delete vm.citySearch;

          vm.airQuality.addTo(vm.map);
          if (!vm.intro) {
            vm.mission.addTo(vm.map);
            vm.badgeNotification.addTo(vm.map);
            vm.notification.addTo(vm.map);
          }
        }
      });

      renderMap();

      if ($rootScope.selectedCity != undefined) {
        $scope.$broadcast("removeMainCitySelect");
        $scope.$broadcast("selectedCity", $rootScope.selectedCity);
      }
    }

    function onZoomEnd(e, d) {
      if (vm.map.getZoom() === 6) {
        if (vm.map.hasLayer(vm.layers.base.osm)) {
          vm.map.removeLayer(vm.layers.base.osm);
        }
        vm.map.addLayer(vm.layers.base.toner);
        vm.map.addLayer(vm.layers.fusion);
      } else {
        if (vm.map.hasLayer(vm.layers.base.toner)) {
          vm.map.removeLayer(vm.layers.base.toner);
          vm.map.removeLayer(vm.layers.fusion);
        }
        vm.map.addLayer(vm.layers.base.osm);
      }

      getData();
    }

    function onMoveEnd(e, d) {
      getData();
    }

    function getData() {
      if (!vm.loading) {
        vm.loading = true;
        var b = vm.map.getZoom();

        var boundBox = vm.map.getBounds().toBBoxString();

        MapService.getMeasurements(boundBox)
          .then(function(measurements) {
            // Add measurement markers to featureLayer
            // Empty it all !

            vm.layers.sensors.clearLayers();
            vm.layers.photos.clearLayers();
            vm.layers.cots.clearLayers(); // MAKIS NEW
            vm.layers.luftdaten.clearLayers(); // MAKIS NEW
            // vm.layers.perceptions.clearLayers();
            vm.layers.webservices.clearLayers();
            vm.layers["my-sensors"].clearLayers();
            vm.layers["my-photos"].clearLayers();

            var markers = filterMeasurements(measurements);
            addMarkersToMap(markers);
          })
          .catch(function(err) {});

        MapService.getPerceptions().then(function(perceptions) {
          vm.layers.perceptions.clearLayers();
          addPerceptionsToMap(perceptions);
        });

        if ($localStorage.user != undefined) {
          MapService.getMyMeasurements(boundBox, $localStorage.user.id).then(
            function(measurements) {
              var filters = {
                sensors: ["sensors_arduino", "sensors_bleair", "sensors_cots"],
                photos: ["flickr", "webcams", "mobile"]
              };

              var myMeasurements = {
                sensors: [],
                photos: []
              };

              measurements.forEach(function(measurement) {
                if (measurement.pollutant_i.index == "perfect") {
                  measurement.pollutant_i.index = "very good";
                }

                if (filters.sensors.indexOf(measurement.source_type) > -1) {
                  myMeasurements.sensors.push(measurement);
                }

                if (filters.photos.indexOf(measurement.source_type) > -1) {
                  myMeasurements.photos.push(measurement);
                }

                var pollutant =
                  measurement.pollutant_q.name == "PM2.5_AirPollutantValue"
                    ? "PM 2.5"
                    : "PM 10";
                measurement.pollutant_v = `${$filter("translate")(
                  "map_pop_ups.Pollutant_value"
                )} (${pollutant}): ${measurement.pollutant_q.value} μg/m3`;
              });

              addMyMarkersToMap(myMeasurements);
            }
          );
        }
      }
    }

    function renderMap(location) {
      var selectedCity;

      var cities = [
        {
          name: "Athens",
          coords: [37.983310135428795, 23.727893829345703]
        },
        {
          name: "Berlin",
          coords: [52.51705655410405, 13.39508056640625]
        },
        {
          name: "Brussels",
          coords: [50.8480064897561, 4.3512725830078125]
        },
        {
          name: "London",
          coords: [51.507914431826606, -0.11638641357421874]
        },
        {
          name: "Oslo",
          coords: [59.91274018614317, 10.734329223632812]
        },
        {
          name: "Thessaloniki",
          coords: [40.63470114170654, 22.943100929260254]
        }
      ];

      // Map configuration

      // var center = L.latLng(40.38002840251183,-2.92236328125); // Iberia
      var center = L.latLng(40.63, 22.949); // Thessaloniki
      if (!location) {
      } else {
        // center = L.latLng(location.coords[0], location.coords[1]);
      }

      var map = L.map("map", {
        // crs: L.CRS.EPSG4326, // Depends on WMS server, default is EPSG3857. Example WMSLayer uses EPSG4326
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: "bottomleft"
        },
        center: center,
        minZoom: 6,
        maxZoom: 16,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      map.on("zoomend", onZoomEnd);
      map.on("moveend", onMoveEnd);

      // Create controls
      setupControls(map);
      setupLayers(map);
      // attachEvents(map);

      function setupLayers(map) {
        // Create map layers
        var osmLayer = L.tileLayer(
          "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        );
        var tonerLayer = L.tileLayer(
          "http://a.tile.stamen.com/toner/{z}/{x}/{y}.png"
        );

        var wmsLayer = L.tileLayer.wms(API_URL + "/map?", {
          layers: "hackair",
          format: "image/png",
          transparent: "true",
          crs: L.CRS.EPSG4326,
          opacity: 0.9
        });

        // CLUSTERING
        // var cotsLayer = L.markerClusterGroup().addTo(map);     // NEW COTS LAYER (MAKIS)
        // var luftdatenLayer = L.markerClusterGroup().addTo(map);     // NEW LUFTDATEN
        // var sensorsLayer = L.markerClusterGroup().addTo(map);
        // var photosLayer = L.markerClusterGroup().addTo(map);
        // var perceptionsLayer = L.markerClusterGroup().addTo(map);
        // var webservicesLayer = L.markerClusterGroup().addTo(map);
        // var mySensorsLayer = L.markerClusterGroup().addTo(map);
        // var myPhotosLayer = L.markerClusterGroup().addTo(map);

        // NO CLUSTERING
        var cotsLayer = L.featureGroup().addTo(map); // NEW COTS LAYER (MAKIS)
        var luftdatenLayer = L.featureGroup().addTo(map); // NEW LUFTDATEN
        var sensorsLayer = L.featureGroup().addTo(map);
        var photosLayer = L.featureGroup().addTo(map);
        var perceptionsLayer = L.featureGroup().addTo(map);
        var webservicesLayer = L.featureGroup().addTo(map);
        var mySensorsLayer = L.featureGroup().addTo(map);
        var myPhotosLayer = L.featureGroup().addTo(map);

        // Attach them all to the vm
        angular.extend(vm, {
          map: map,
          layers: {
            base: {
              osm: osmLayer,
              toner: tonerLayer
            },
            cots: cotsLayer, // NEW COTS LAYER (MAKIS)
            luftdaten: luftdatenLayer, // NEW LUFTDATEN
            fusion: wmsLayer,
            sensors: sensorsLayer,
            photos: photosLayer,
            webservices: webservicesLayer,
            perceptions: perceptionsLayer,
            "my-sensors": mySensorsLayer,
            "my-photos": myPhotosLayer
          }
        });

        vm.layers.base.osm.addTo(map);
      }

      var boundBox = map.getBounds().toBBoxString();

      function setupControls(map) {
        addControlPlaceholders(map);

        L.Control.layerPicker = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-layer-picker open");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            var header = L.DomUtil.create("div", "header", container);

            L.DomEvent.on(header, "click", function() {
              var open = L.DomUtil.hasClass(container, "open");
              if (open) {
                L.DomUtil.removeClass(container, "open");
              } else {
                L.DomUtil.addClass(container, "open");
              }
            });

            var icon = L.DomUtil.create("div", "icon", header);
            var title = L.DomUtil.create("div", "title", header);
            title.innerText = $filter('translate')('map_filter');
            var filtersContainer = L.DomUtil.create(
              "div",
              "filters",
              container
            );

            var filters = [
              {
                label: $filter("translate")("filters.filter_map"),
                class: "fusion",
                description: $filter("translate")("filters.filter_map_desc")
              },
              {
                label: $filter("translate")("filters.filter_cardboard"), // NEW FILTER FOR COTS MEASUREMENTS (MAKIS)
                class: "cots active",
                description: $filter("translate")(
                  "filters.filter_cardboard_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_sensors_luftdaten"), // NEW LUFTDATEN
                class: "luftdaten active",
                description: $filter("translate")(
                  "filters.filter_sensors_luftdaten_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_sensors_hackair"),
                class: "sensors active",
                description: $filter("translate")(
                  "filters.filter_sensors_hackair_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_sky_photos"),
                class: "photos active",
                description: $filter("translate")(
                  "filters.filter_sky_photos_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_stations"),
                class: "open-data active",
                description: $filter("translate")(
                  "filters.filter_stations_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_perceptions"),
                class: "perceptions active",
                description: $filter("translate")(
                  "filters.filter_perceptions_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_my_sensors"),
                class: "my-sensors active",
                description: $filter("translate")(
                  "filters.filter_my_sensors_desc"
                )
              },
              {
                label: $filter("translate")("filters.filter_my_photos"),
                class: "my-photos active",
                description: $filter("translate")(
                  "filters.filter_my_photos_desc"
                )
              }
            ];

            if (vm.intro) {
              // Remove two last filters if map rendered on intro page
              filters.pop();
              filters.pop();
            }

            filters.forEach(function(filter) {
              var filterContainer = L.DomUtil.create(
                "div",
                "filter " + filter.class,
                filtersContainer
              );
              L.DomUtil.create("div", "icon", filterContainer);
              L.DomUtil.create("span", "label", filterContainer).innerText =
                filter.label;
              $(filterContainer).attr("data-toggle", "popover");
              $(filterContainer).attr("data-content", filter.description);
              var checker = L.DomUtil.create(
                "span",
                "checker active",
                filterContainer
              );
              L.DomUtil.create("i", "ion-checkmark", checker);

              L.DomEvent.on(filterContainer, "click", function() {
                var hasClass = L.DomUtil.hasClass(this, "active");

                if (hasClass) {
                  L.DomUtil.removeClass(filterContainer, "active");
                } else {
                  L.DomUtil.addClass(filterContainer, "active");
                }

                $scope.$emit("toggleLayer", filter.class.split(" ")[0]);
              });
            });

            setTimeout(() => {
              $('[data-toggle="popover"]').popover({
                container: "body",
                placement: "left",
                trigger: "hover"
              });
            }, 200);

            return container;
          },
          onRemove: function(map) {
            //
          }
        });

        L.Control.compare = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "cities-compare");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            var header = L.DomUtil.create("div", "header", container);

            var title = L.DomUtil.create("div", "title", header);

            $translate("map.compare_cities").then(function(translation) {
              title.innerText = translation;
            });

            // title.innerText = 'Compare Cities';

            L.DomEvent.on(container, "click", function() {
              var modalInstance = $uibModal.open({
                templateUrl: "app/components/map/compare-cities.html",
                controller: function($uibModalInstance, $scope, $state) {
                  var vm = this;
                  vm.bothSelected = true;
                  vm.cities = [
                    {
                      name: "Athens",
                      coords: [37.983310135428795, 23.727893829345703]
                    },
                    {
                      name: "Berlin",
                      coords: [52.51705655410405, 13.39508056640625]
                    },
                    {
                      name: "Brussels",
                      coords: [50.8480064897561, 4.3512725830078125]
                    },
                    {
                      name: "London",
                      coords: [51.507914431826606, -0.11638641357421874]
                    },
                    {
                      name: "Oslo",
                      coords: [59.91274018614317, 10.734329223632812]
                    },
                    {
                      name: "Thessaloniki",
                      coords: [40.63470114170654, 22.943100929260254]
                    }
                  ];

                  vm.cancel = function() {
                    $uibModalInstance.dismiss("close");
                  };
                  vm.ok = function() {
                    if (
                      vm.selectedCity1 === undefined ||
                      vm.selectedCity2 === undefined
                    ) {
                      vm.bothSelected = false;
                    } else {
                      $uibModalInstance.dismiss("close");
                      $state.go("chartCompare", {
                        city1: vm.selectedCity1.name,
                        city2: vm.selectedCity2.name
                      });
                    }
                  };
                  vm.selectCity1 = function(city) {
                    vm.selectedCity1 = city;
                  };
                  vm.selectCity2 = function(city) {
                    vm.selectedCity2 = city;
                  };
                },
                size: "md",
                controllerAs: "vm"
              });
            });

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.citySearch = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-cities");
            var citySearch = L.DomUtil.create("city-select", "", container);

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            citySearch.setAttribute("main", "true");
            $compile(citySearch)($scope);

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.airQuality = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-airquality");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            // City search section
            var citySearch = L.DomUtil.create("city-select", "", container);
            $compile(citySearch)($scope);

            var aqinfo = L.DomUtil.create("air-quality-info", "", container);
            // Get from api/aq
            // aqinfo.setAttribute('quality','excellent');
            if (!vm.intro) {
              aqinfo.setAttribute("activities", "true");
              $timeout(function() {
                vm.scale.addTo(map);
              }, 0);
            } else {
              aqinfo.setAttribute("scale", "true");
            }
            var el = $compile(aqinfo)($scope);

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.scale = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-scale");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            var img = L.DomUtil.create("img", "scale", container);

            img.src = "/img/airquality/scale-lg.png";
            img.height = 41;

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.mission = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-mission");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            // var aqinfo = angular.element(document.createElement('air-quality-info'));

            var mission = L.DomUtil.create("mission", "", container);
            // Get from api/aq
            var el = $compile(mission)($scope);

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.notification = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-notification");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            // var aqinfo = angular.element(document.createElement('air-quality-info'));

            var notification = L.DomUtil.create("notification", "", container);

            // Get from api/aq
            notification.setAttribute("scale", "true");
            var el = $compile(notification)($scope);

            return container;
          },
          onRemove: function(map) {}
        });

        L.Control.badgeNotification = L.Control.extend({
          onAdd: function(map) {
            var container = L.DomUtil.create("div", "map-badgeNotification");
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            // var aqinfo = angular.element(document.createElement('air-quality-info'));

            var badgeNotification = L.DomUtil.create(
              "badge-notification",
              "",
              container
            );

            // Get from api/aq
            badgeNotification.setAttribute("scale", "true");
            var el = $compile(badgeNotification)($scope);

            return container;
          },
          onRemove: function(map) {}
        });

        vm.airQuality = new L.Control.airQuality({
          position: "topleft"
        });
        vm.scale = new L.Control.scale({
          position: "topleft"
        });
        vm.mission = new L.Control.mission({
          position: "topleft"
        });
        vm.notification = new L.Control.notification({
          position: "topleft"
        });
        vm.citySearch = new L.Control.citySearch({
          position: "verticalcenterleft"
        }).addTo(map);
        // vm.citySearch = new L.Control.citySearch({position: 'topleft'}).addTo(map);
        vm.badgeNotification = new L.Control.badgeNotification({
          position: "topleft"
        });

        vm.layerPicker = new L.Control.layerPicker({
          position: "topright"
        }).addTo(map);

        vm.zoomControl = L.control
          .zoom({
            position: "bottomright"
          })
          .addTo(map);
        // compare cities button - in order to show the button uncomment the line bellow
        // vm.compare = new L.Control.compare({position:'bottomright'}).addTo(map);
      }

      function addControlPlaceholders(map) {
        var corners = map._controlCorners,
          l = "leaflet-",
          container = map._controlContainer;

        function createCorner(vSide, hSide) {
          var className = l + vSide + " " + l + hSide;

          corners[vSide + hSide] = L.DomUtil.create(
            "div",
            className,
            container
          );
        }

        createCorner("verticalcenter", "left");
        createCorner("verticalcenter", "right");
      }
    }
    // Create Icons

    var luftdatenIcon = L.icon({
      // NEW LUFTDATEN
      iconUrl: "/img/icons/cots_icon_pin.png", // NEW LUFTDATEN
      iconSize: [24, 36], // NEW LUFTDATEN
      iconAnchor: [12.5, 36], // NEW LUFTDATEN
      popupAnchor: [0, -35] // NEW LUFTDATEN
    });

    var cotsIcon = L.icon({
      // NEW COTS ICON (MAKIS)
      iconUrl: "/img/icons/cots_icon_pin.png", // NEW COTS ICON (MAKIS)
      iconSize: [24, 36], // NEW COTS ICON (MAKIS)
      iconAnchor: [12.5, 36], // NEW COTS ICON (MAKIS)
      popupAnchor: [0, -35] // NEW COTS ICON (MAKIS)
    });

    var sensorIcon = L.icon({
      iconUrl: "/img/icons/u_i_pin_sensor.svg",
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35]
    });

    var photoIcon = L.icon({
      iconUrl: "/img/icons/u_i_pin_photo.svg",
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35]
    });

    var perceptionIcon = L.icon({
      iconUrl: "/img/icons/u_i_pin_perception.svg",
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35]
    });

    var webservicesIcon = L.icon({
      iconUrl: "/img/icons/u_i_pin_open_data.svg",
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35]
    });

    // var mySensorIcon = L.icon({
    //   iconUrl: "/img/icons/u_i_pin_my_sensor.svg",
    //   iconSize: [24, 36],
    //   iconAnchor: [12.5, 36],
    //   popupAnchor: [0, -35]
    // });

    var myPhotoIcon = L.icon({
      iconUrl: "/img/icons/u_i_pin_my_photo.svg",
      iconSize: [24, 36],
      iconAnchor: [12.5, 36],
      popupAnchor: [0, -35]
    });

    function toggleLayer(layer) {
      if (layer === "open-data") {
        layer = "webservices";
      }
      if (vm.layers[layer] == undefined) {
        return;
      }

      if (vm.map.hasLayer(vm.layers[layer])) {
        vm.map.removeLayer(vm.layers[layer]);
      } else {
        vm.map.addLayer(vm.layers[layer]);
      }

      if (layer == "sensors") {
        if (vm.map.hasLayer(vm.layers["my-sensors"])) {
          vm.map.removeLayer(vm.layers["my-sensors"]);
          vm.map.addLayer(vm.layers["my-sensors"]);
        }
      }
    }

    function filterMeasurements(measurements) {
      var filters = {
        sensors: ["sensors_arduino", "sensors_bleair"],
        photos: ["flickr", "webcams", "mobile"],
        webservices: ["webservices"]
      };

      var types = {
        sensors: [],
        sensors_cots: [], // MAKIS
        sensors_luftdaten: [], // LUFTDATEN
        photos: [],
        webservices: []
      };

      var unique = {};

      measurements.forEach(function(measurement, index) {
        // MAKIS START
        if (measurement.source_type === "sensors_cots") {
          types.sensors_cots.push(measurement);

          var pollutant =
            measurement.pollutant_q.name == "PM2.5_AirPollutantValue"
              ? "PM 2.5"
              : "PM 10";
          measurement.pollutant_v = "";
        }
        // MAKIS END

        if (measurement.pollutant_i.index == "perfect") {
          measurement.pollutant_i.index = "very good";
        }

        if (measurement.pollutant_q.value != "nan") {
          if (filters.sensors.indexOf(measurement.source_type) > -1) {
            // Sensor measurement
            // if ($localStorage.user !== undefined){
            //   if (measurement.source_info.user.id == $localStorage.user.id){ return; } // Dont bring my own measurements if logged in
            // }

            var key = measurement.source_info.sensor.id;
            var pollutant =
              measurement.pollutant_q.name == "PM2.5_AirPollutantValue"
                ? "PM 2.5"
                : "PM 10";
            measurement.pollutant_v = `${$filter("translate")(
              "map_pop_ups.Pollutant_value"
            )} (${pollutant}): ${measurement.pollutant_q.value} μg/m3`;

            if (
              measurements[index + 1] &&
              measurement.source_info.sensor &&
              measurements[index + 1].source_info.sensor
            ) {
              if (measurement.source_type === measurements[index].source_type) {
                if (
                  measurement.source_info.sensor &&
                  measurement.source_info.sensor.id ===
                    measurements[index + 1].source_info.sensor.id
                ) {
                  measurements[index + 1].pollutant_v_second = `${$filter(
                    "translate"
                  )("map_pop_ups.Pollutant_value")} (${pollutant}): ${
                    measurements[index].pollutant_q.value
                  } μg/m3`;
                }
              }
            }

            if (typeof (unique[key] == "undefined")) {
              unique[key] = measurement;
            }

            if (unique[key].datetime < measurement.datetime) {
              unique[key] = m;
            }
          }
        }

        if (filters.photos.indexOf(measurement.source_type) > -1) {
          // Photo measurement
          // if ($localStorage.user !== undefined){
          //   if (measurement.source_info.user && measurement.source_info.user.id == $localStorage.user.id){ return; } // Dont bring my own measurements if logged in
          // }

          types.photos.push(measurement);
        }

        if (filters.webservices.indexOf(measurement.source_type) > -1) {
          // Webservice measurement
          var pollutant =
            measurement.pollutant_q.name == "PM2.5_AirPollutantValue"
              ? "PM 2.5"
              : "PM 10";
          measurement.pollutant_v =
            $filter("translate")("map_pop_ups.Pollutant_value") +
            "(" +
            pollutant +
            "): " +
            measurement.pollutant_q.value.toFixed(2) +
            " μg/m3";

          // LUFTDATEN START
          if (measurement.source_info.source === "luftdaten") {
            types.sensors_luftdaten.push(measurement);
          }
          // LUFTDATEN END
          else {
            types.webservices.push(measurement);
          }
        }

        // } else {
        // }
      });

      for (var i in unique) {
        types.sensors.push(unique[i]);
      }

      return {
        cots: types.sensors_cots, // MAKIS NEW
        luftdaten: types.sensors_luftdaten, // LUFTDATEN NEW
        arduino: types.sensors,
        flickr: types.photos,
        webservices: types.webservices
      };
    }

    function addMarkersToMap(markers) {
      vm.loading = false;

      markers.cots.forEach(function(m) {
        // MAKIS
        var popup = createSensorPopup(m); // MAKIS
      }); // MAKIS

      markers.luftdaten.forEach(function(m) {
        // LUFTDATEN
        var popup = createWebServicesPopup(m); // LUFTDATEN
      }); // LUFTDATEN

      markers.arduino.forEach(function(m) {
        var popup = createSensorPopup(m);
      });

      markers.flickr.forEach(function(m) {
        var popup = createFlickrPopup(m);
      });

      markers.webservices.forEach(function(m) {
        var popup = createWebServicesPopup(m);
      });
    }

    function addMyMarkersToMap(markers) {
      markers.sensors.forEach(function(m) {
        var popup = createMySensorPopup(m);
      });

      markers.photos.forEach(function(m) {
        var popup = createMyFlickrPopup(m);
      });
    }

    function addPerceptionsToMap(perceptions) {
      perceptions.forEach(function(perception) {
        var latlng = perception.location;
        var popup = createPerceptionPopup(perception);
      });
    }

    // Heart Icon
    function createPerceptionPopup(perception) {
      var key_pollutantIndex = perception.perception;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "air_quality." + key_pollutantIndex
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);
        var latlng = perception.location;

        if (angular.isArray(latlng)) {
          if (latlng[0] != null) {
            var marker = L.marker(latlng, {
              icon: perceptionIcon
              // title: perception.perception
            });
            marker.bindPopup(popup);
            marker.addTo(vm.layers["perceptions"]);
          }
        }
      });

      var setTranslations = function(translation) {
        var popup = L.DomUtil.create("div", "measurement-popup");
        var time = moment(perception.date_str).format("DD-MM-YYYY HH:mm:ss");
        var timeContainer = L.DomUtil.create("div", "time-container", popup);
        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();
        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[1];
        return popup;
      };
    }

    function createWebServicesPopup(measurement) {
      var key_pollutantIndex = measurement.pollutant_i.index;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "map_pop_ups.Source",
        "air_quality." + key_pollutantIndex,
        "map_pop_ups.Pollutant_value"
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);

        // if(measurement.source_info.source === 'luftdaten')
        // {
        //   var marker = L.marker([measurement.loc.coordinates[1], measurement.loc.coordinates[0]], {
        //     icon: sensorIcon, //if source type is 'luftdaten' then show the blue sensor icon
        //     title: measurement.pollutant_i.index
        //   });
        // marker.bindPopup(popup);
        // marker.addTo(vm.layers.sensors);
        // }

        // NEW LUFTDATEN START
        // console.log(measurement.pollutant_i.index);
        // console.log(measurement.pollutant_i.index);
        vm.quality = measurement.pollutant_i.index;

        var sensorIcon = L.icon({
          iconUrl: `/img/icons/u_i_pin_sensor_${
            measurement.pollutant_i.index
          }.svg`,
          iconSize: [24, 36],
          iconAnchor: [12.5, 36],
          popupAnchor: [0, -35]
        });

        if (measurement.source_info.source === "luftdaten") {
          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: sensorIcon //if source type is 'luftdaten' then show the blue sensor icon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers.luftdaten);
        }
        // NEW LUFTDATEN END
        else {
          var webservicesIcon = L.icon({
            iconUrl: `/img/icons/u_i_pin_open_data_${
              measurement.pollutant_i.index
            }.svg`,
            iconSize: [24, 36],
            iconAnchor: [12.5, 36],
            popupAnchor: [0, -35]
          });

          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: webservicesIcon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers.webservices);
        }
      });

      var setTranslations = function(translation) {
        var popup = L.DomUtil.create("div", "measurement-popup");
        var time = moment(measurement.date_str).format("DD-MM-YYYY HH:mm:ss");
        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[2];
        L.DomUtil.create("p", "", popup).innerText = measurement.pollutant_v;
        L.DomUtil.create("p", "", popup).innerText =
          translation[1] + " " + getSource(measurement.source_info.source);
        var timeContainer = L.DomUtil.create("div", "time-container", popup);

        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();

        return popup;
      };
    }

    function getSource(source) {
      switch (source) {
        case "openaq":
          return "OpenAQ.org";
          break;
        case "luftdaten":
          return "luftdaten.info";
          break;
        default:
          return "";
      }
    }

    function createSensorPopup(measurement) {
      var key_pollutantIndex = measurement.pollutant_i.index;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "air_quality." + key_pollutantIndex
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);

        // MAKIS NEW START
        if (measurement.source_type === "sensors_cots") {
          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: cotsIcon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers.cots);
        } else {
          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: sensorIcon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers.sensors);
          if (measurement.source_info.user.id === $localStorage.user.id) {
            marker.addTo(vm.layers["my-sensors"]);
          }
        }
        // MAKIS NEW END

        // var marker = L.marker([measurement.loc.coordinates[1], measurement.loc.coordinates[0]], {
        //   icon: sensorIcon,
        //   title: measurement.pollutant_i.index
        // });
        // marker.bindPopup(popup);
        // marker.addTo(vm.layers.sensors);
      });

      var setTranslations = function(translation) {
        var sensorType;

        switch (measurement.source_type) {
          case "sensors_cots":
            sensorType = "hackAIR cardboard";
            break;
          case "sensors_arduino":
            sensorType = "hackAIR home";
            break;
          case "sensors_bleair":
            sensorType = "hackAIR mobile";
            break;
          default:
            sensorType = "hackAIR home";
        }

        var popup = L.DomUtil.create("div", "measurement-popup");
        var time = moment(measurement.date_str).format("DD-MM-YYYY HH:mm:ss");
        L.DomUtil.create("div", "img-sensor " + measurement.source_type, popup);
        L.DomUtil.create("h3", "", popup).innerText =
          measurement.source_info.user.username || "";
        L.DomUtil.create("p", "", popup).innerText = sensorType;
        var timeContainer = L.DomUtil.create("div", "time-container", popup);
        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();

        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[1];
        L.DomUtil.create("p", "", popup).innerText = measurement.pollutant_v;
        L.DomUtil.create(
          "p",
          "",
          popup
        ).innerText = measurement.pollutant_v_second
          ? measurement.pollutant_v_second
          : "";
        return popup;
      };
    }

    function createMySensorPopup(measurement) {
      var key_pollutantIndex = measurement.pollutant_i.index;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "air_quality." + key_pollutantIndex
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);

        // MAKIS NEW START
        if (measurement.source_type === "sensors_cots") {
          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: cotsIcon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers.cots);
        } else {
          var marker = L.marker(
            [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
            {
              icon: mySensorIcon
              // title: measurement.pollutant_i.index
            }
          );
          marker.bindPopup(popup);
          marker.addTo(vm.layers["my-sensors"]);
        }
        // MAKIS NEW END

        // var marker = L.marker([measurement.loc.coordinates[1], measurement.loc.coordinates[0]], {
        //   icon: mySensorIcon,
        //   title: measurement.pollutant_i.index
        // });
        // marker.bindPopup(popup);
        // marker.addTo(vm.layers['my-sensors']);
      });

      var setTranslations = function(translation) {
        var sensorType;

        switch (measurement.source_type) {
          case "sensors_cots":
            sensorType = "hackAIR cardboard";
            break;
          case "sensors_arduino":
            sensorType = "hackAIR home";
            break;
          case "sensors_bleair":
            sensorType = "hackAIR mobile";
            break;
          default:
            sensorType = "hackAIR home";
        }

        var popup = L.DomUtil.create("div", "measurement-popup");
        var time = moment(measurement.date_str).format("DD-MM-YYYY HH:mm:ss");
        L.DomUtil.create("div", "img-sensor " + measurement.source_type, popup);
        console.log(1);

        L.DomUtil.create("h3", "", popup).innerText =
          measurement.source_info.user.username || "";
        L.DomUtil.create("p", "", popup).innerText = sensorType;
        var timeContainer = L.DomUtil.create("div", "time-container", popup);
        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();

        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[1];
        L.DomUtil.create("p", "", popup).innerText = measurement.pollutant_v;
        return popup;
      };
    }

    function createFlickrPopup(measurement) {
      var key_pollutantIndex = measurement.pollutant_i.index;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "air_quality." + key_pollutantIndex
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);
        var marker = L.marker(
          [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
          {
            icon: photoIcon
            // title: measurement.pollutant_i.index
          }
        );
        marker.bindPopup(popup);
        marker.addTo(vm.layers.photos);
      });

      var setTranslations = function(translation) {
        var time = moment(measurement.date_str).format("DD-MM-YYYY HH:mm:ss");

        var popup = L.DomUtil.create("div", "measurement-popup");
        var a = L.DomUtil.create("a", "", popup);
        a.href =
          measurement.source_info.page_url ||
          measurement.source_info.url_original;
        var img = L.DomUtil.create("img", "img-responsive", a);
        img.src = measurement.source_info.image_url;

        var username;

        if (measurement.source_info.username != undefined) {
          username = measurement.source_info.username;
        } else if (measurement.source_info.user != undefined) {
          username = measurement.source_info.user.username;
        } else {
          username = "";
        }

        L.DomUtil.create("h3", "", popup).innerText = username;
        var timeContainer = L.DomUtil.create("div", "time-container", popup);
        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();

        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[1];

        return popup;
      };
    }

    function createMyFlickrPopup(measurement) {
      var key_pollutantIndex = measurement.pollutant_i.index;
      if (key_pollutantIndex === "very good") key_pollutantIndex = "very_good";
      var translation_keys = [
        "air_quality.air_quality_is",
        "air_quality." + key_pollutantIndex
      ];

      $translate([translation_keys]).then(function(translation) {
        for (var key in translation) {
          var translation2 = translation[key];
        }
        var translation3 = [];
        for (var key in translation2) {
          translation3.push(translation2[key]);
        }
        var popup = setTranslations(translation3);
        var marker = L.marker(
          [measurement.loc.coordinates[1], measurement.loc.coordinates[0]],
          {
            icon: myPhotoIcon
            // title: measurement.pollutant_i.index
          }
        );
        marker.bindPopup(popup);
        marker.addTo(vm.layers["my-photos"]);
      });

      var setTranslations = function(translation) {
        var popup = L.DomUtil.create("div", "measurement-popup");
        var time = moment(measurement.date_str).format("DD-MM-YYYY HH:mm:ss");
        var a = L.DomUtil.create("a", "", popup);
        a.href =
          measurement.source_info.page_url ||
          measurement.source_info.url_original;
        var img = L.DomUtil.create("img", "img-responsive", a);
        img.src = measurement.source_info.image_url;

        var username;

        if (measurement.source_info.username != undefined) {
          username = measurement.source_info.username;
        } else if (measurement.source_info.user != undefined) {
          username = measurement.source_info.user.username;
        } else {
          username = "";
        }

        L.DomUtil.create("h3", "", popup).innerText = username;
        var timeContainer = L.DomUtil.create("div", "time-container", popup);
        L.DomUtil.create("span", "", timeContainer).innerText = time;
        L.DomUtil.create("br", "", timeContainer);
        L.DomUtil.create("span", "", timeContainer).innerText =
          "Timezone:" + moment.tz.guess();

        L.DomUtil.create("h2", "", popup).innerText =
          translation[0] + " " + translation[1];
        return popup;
      };
    }
  }
})();
