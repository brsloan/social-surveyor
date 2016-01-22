angular.module('socialSurveyor')
    .controller('PollCtrl', [
      '$scope',
      'polls',
      'poll',
      'username',
      'auth',
      function($scope, polls, poll, username, auth){
        $scope.poll = poll;
        $scope.username = username;
        $scope.chosenOption = {};
        $scope.hasVoted = localStorage.getItem(poll._id);
        $scope.voteForOption = function(){
          var chosenOption = poll.options.filter(function(option){
            return option._id == $scope.chosenOption.id;
          })[0];
          polls.voteForOption(username, poll, chosenOption, drawChart);
          localStorage.setItem(poll._id, true);
          $scope.hasVoted = true;
        };
        $scope.isLoggedIn = auth.isLoggedIn();
        $scope.extraOption = {};
        $scope.addOption = function(){
           polls.addOptions(poll._id, [$scope.extraOption], function(newOption){
             poll.options.push({title: newOption.title, _id: newOption._id, votes: 0});
             $scope.extraOption.title = '';
             drawChart();
           });
        };
        
        drawChart();
        
        function drawChart(){
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Option');
            data.addColumn('number', 'Votes');
            
            var maxVotes = 0;
            for(var i=0;i<poll.options.length;i++){
              data.addRows([
                  [poll.options[i].title, poll.options[i].votes]
                ]);
              if(poll.options[i].votes > maxVotes)
                maxVotes = poll.options[i].votes;
            }
    
            // Set chart options
            var options = {'title':poll.title + '?',
                            'legend': 'none',
                            'height': 400,
                           'vAxis': {maxValue: maxVotes, minValue: 0}
                           
            };
    
            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(data, options);
        }
      }
    ])