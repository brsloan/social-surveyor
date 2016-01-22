angular.module('socialSurveyor')
    .controller('MainCtrl', [
      '$scope',
      'polls',
      'auth',
      function($scope, polls, auth){
        $scope.options = polls.newOptions;
        $scope.addPoll = function(){
          if(!$scope.title || $scope.title === ''){return;}
          polls.create({
            title:  $scope.title.replace(/[^a-zA-Z0-9-_\s]/g, ''),
            options: $scope.options
          }, function(poll){
            $scope.pollLink = document.location.origin + "/#/" + auth.currentUser() + "/polls/" + poll.title;
            $scope.tweetLink = "https://twitter.com/intent/tweet?text=" + 
              encodeURIComponent(poll.title + '? Vote in my poll: ' + $scope.pollLink);
            $scope.urlEncodedLink = encodeURIComponent($scope.pollLink);
            polls.clearNewOptions();
          });
        };
        
        $scope.addOption = polls.addEmptyOption;
        $scope.removeOption = function(){
          if(polls.newOptions.length > 2)
            polls.newOptions.pop();
        };
        $scope.encodedSelfLink = encodeURIComponent(document.location.origin);
        
        $scope.isLoggedIn = auth.isLoggedIn;
        
        if(!auth.isLoggedIn())
          drawChart();
        
        function drawChart() {
    
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Western');
            data.addColumn('number', 'Votes');
            data.addRows([
              ['The Good The Bad and The Ugly', 253],
              ['Unforgiven', 225],
              ['Django Unchained', 157],
              ['Outlaw Josey Wales', 100],
              ['True Grit - Coen Bros', 78]
            ]);
    
            // Set chart options
            var options = {'title':'Best Western',
                            'legend': 'none',
                           'height':500};
    
            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(data, options);
          }
    
      }
    ])