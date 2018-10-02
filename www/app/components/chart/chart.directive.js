(function(){
  angular.module('app.components')
  .directive('chart', chart);

  function chart() {
    var directive = {
          restrict: 'E',
          replace: true,
          templateUrl: 'app/components/chart/chart.html',
          scope: {
            type: '@'
          },
          link: link,
          controller: 'ChartController',
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

        scope.$on('chartChanges', function(event, range) {
          if (scope.vm.type == 'barChart') {
            if (range.value==1){
              getAQData(7);
            }
            else if(range.value==2){
              getAQData(30);
            }
            else {
              getAQData(360);
            }
          }
        });

        scope.$on('selectedCity', function(event, city) {
          if (scope.vm.type == 'barChart') {
              scope.consoleCity();
              getAQData(7);
          }
        });

        function getAQData(days) {

          chartData = {
            labels: [],
            data: [],
            backgroundColor: []
          }

          var dateStart = moment().subtract(days, 'days').format('YYYY-MM-DD');

          scope.getAQ(dateStart).then(function(response) {
            var data = response.data.data;
            data.forEach(function(value){
              chartData.labels.push( moment(value.date).format('DD/MM') );
              chartData.data.push( value.AQI_Value );
              chartData.backgroundColor.push( getColor(value.AQI_Index) );
            });

            if (historyBarChart) {
              historyBarChart.destroy();
            }

            historyBarChart = createAQHistoryChart(chartData, canvas);
          });

        }
      }

      function getColor(index) {
        switch (index) {
          case 'perfect':
            return "rgb(125, 187, 66)";
          case 'good':
            return "rgb(254, 204, 9)";
          case 'medium':
            return "rgb(246, 142, 31)";
          case 'bad':
            return "rgb(239, 71, 35)";
          default:
            return "rgb(125, 187, 66)";
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

      function createAQHistoryChart(chartData, canvas) {
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
                backgroundColor: chartData.backgroundColor
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
                  color: "rgb(232, 232, 232)",
                  lineWidth: 1
                },
                scaleLabel:{
                    display: true,
                    labelString: 'hackAIR AQI index',
                    lineHeight: 2,
                    fontSize: 18,
                    fontStyle: 'normal',
                    padding: 0,
                    fontColor: "#666"
                }                   
              }],
              xAxes:[{
                ticks: {
                  fontColor: '#666666'
                },
                gridLines: {
                  display:false
                },
                scaleLabel:{
                    display: true,
                    labelString: 'Date',
                    lineHeight: 2,
                    fontSize: 18,
                    fontStyle: 'normal',
                    padding: 0,
                    fontColor: "#666"
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
