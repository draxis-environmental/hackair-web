(function(){
  angular.module('app.chartCompare')
  .directive('chartCompare', chartCompare);

  chartCompare.$inject = ['ngToast'];

  function chartCompare(ngToast) {
    var directive = {
          restrict: 'E',
          replace: true,
          templateUrl: 'app/components/chartCompare/chartCompare.html',
          scope: {
            type: '@'
          },
          link: link,
          controller: 'chartCompareController',
          controllerAs: 'vm',
          bindToController: true // because the scope is isolated
      };

      return directive;

      function link(scope, el, attr, vm)
      {

        var historyBarChart;
        var canvas = el[0];
        var chartData;

        doughnutData = getDataSourcesData();

        switch (vm.type) {
          case 'barChart':
            break;
          case 'donutChart':
            createDoughnutChart(doughnutData, canvas);
        }

        scope.$on('chartCompareChanges', function(event, range) {
          if (scope.vm.type == 'barChart') {
            if (range.value==1){
              getAQData(7, scope.city1, scope.city2);
            }
            else if(range.value==2){
              getAQData(30, scope.city1, scope.city2);
            }
            else {
              getAQData(360, scope.city1, scope.city2);
            }
          }
        });


        getAQData(7, scope.city1, scope.city2);

        function getAQData(days, city1, city2) {

          chartData = {
            labels: [],
            data: [],
            backgroundColor: []
          }

          chartData2 = {
            labels: [],
            data: [],
            backgroundColor: []
          }

          var dateStart = moment().subtract(days, 'days').format('YYYY-MM-DD');

          scope.getAQ2(dateStart, city1).then(function(response) {
            var data = response.data.data;
            data.forEach(function(value){
              chartData.labels.push( moment(value.date).format('DD/MM') );
              chartData.data.push( value.AQI_Value );
              chartData.backgroundColor.push( getColor(value.AQI_Index) );
            });

            // second city request:start
            scope.getAQ2(dateStart, city2).then(function(response) {
              var data2 = response.data.data;
              data2.forEach(function(value){
                chartData2.labels.push( moment(value.date).format('DD/MM') );
                chartData2.data.push( value.AQI_Value );
                chartData2.backgroundColor.push( getColor(value.AQI_Index) );
              });

            if (historyBarChart) {
              historyBarChart.destroy();
            }

            historyBarChart = createAQHistoryChart(chartData, chartData2, canvas);

            }).catch(function failed(response){
              scope.catchErrorinToast();
            })

            // second city request:end
          }).catch(function failed(response){
              scope.catchErrorinToast();
            })
        }
      }

      function getColor(index) {
        switch (index) {
          case 'perfect':
            return "#00a3ac";
          case 'good':
            return "#ac4f4f";
          case 'medium':
            return "#ff6666";
          case 'bad':
            return "#227c81";
          default:
            return "#00a3ac";
        }
      }

      function getDataSourcesData() {
        data = {
          datasets: [{
            data: [45, 39, 16],
            backgroundColor: ['#227c81','#00a3ac','#ff6666']
          }],

          labels: [
            'Open Data',
            'Contributors',
            'Sensors'
          ]
        };
        return data;
      }

      function createDoughnutChart(chartData, canvas) {

        var ctx = canvas.getContext('2d');
        var myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
              legend: {
                position: 'bottom'
              }
            }
        });
      }

      function createAQHistoryChart(chartData, chartData2, canvas) {
        if (canvas){
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
        }

        var myChart = new Chart(ctx, {
          responsive: false,
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: [{
                label: '',
                data: chartData.data,
                backgroundColor: "rgb(125, 187, 66)"
            },
            {
                label: '',
                data: chartData2.data,
                backgroundColor: "#f73a3a"
            }]
          },
          options: {
            legend: {
              display: false,
            },

            scales: {
              yAxes: [{
                  ticks: {
                    beginAtZero: false,
                    fontColor: '#666666',
                  },
                  gridLines: {
                    color: "rgba(0, 163, 172, 0.2)",
                    lineWidth: 1
                  },
              }],
              xAxes:[{
                ticks: {
                  fontColor: '#666666'
                },
                gridLines: {
                  display:false
                }
              }]
            },
            tooltips: {
              backgroundColor: '#022b3a'
            }
          }
        });
        return myChart;
      }
    }
})();
