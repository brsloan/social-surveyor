angular.module('socialSurveyor')
    .controller('PollCtrl', [
      '$scope',
      'polls',
      'poll',
      'username',
      'auth',
      'chart',
      function($scope, polls, poll, username, auth, chart){
        $scope.poll = poll;
        $scope.username = username;
        $scope.chosenOption = {};
        $scope.hasVoted = localStorage.getItem(poll._id);
        $scope.voteForOption = voteForOption;
        $scope.isLoggedIn = auth.isLoggedIn();
        $scope.extraOption = {};
        $scope.addOption = addOption;
        
        drawChart();
        
        function voteForOption(){
          var chosenOption = poll.options.filter(function(option){
            return option._id == $scope.chosenOption.id;
          })[0];
          polls.voteForOption(username, poll, chosenOption, drawChart);
          localStorage.setItem(poll._id, true);
          $scope.hasVoted = true;
        }
        
        function addOption(){
          polls.saveOptions(poll._id, [$scope.extraOption], function(newOption){
             poll.options.push({title: newOption.title, _id: newOption._id, votes: 0});
             $scope.extraOption.title = '';
             drawChart();
           });
        }
        
        function drawChart(){
            chart.drawFromPoll(poll);
        }
      }
    ])