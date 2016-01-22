angular.module('socialSurveyor')
    .controller('MainCtrl', [
      '$scope',
      'polls',
      'auth',
      'chart',
      'home',
      function($scope, polls, auth, chart, home){
        $scope.options = home.newOptions;
        $scope.addPoll = addPoll;
        $scope.addOption = home.addNewOption;
        $scope.removeOption = home.removeNewOption;
        $scope.encodedSelfLink = encodeURIComponent(document.location.origin);
        $scope.isLoggedIn = auth.isLoggedIn;
        
        if(!auth.isLoggedIn())
          chart.drawExample();
        
        function addPoll(){
          if(!$scope.title || $scope.title === ''){return;}
          polls.save({
            title:  $scope.title.replace(/[^a-zA-Z0-9-_\s]/g, ''),
            options: $scope.options
          }, setLinksAndClearFields);
        }
        
        function setLinksAndClearFields(poll){
          setLinksToPoll(poll);
          home.clearNewOptions();
        }
        
        function setLinksToPoll(poll){
          $scope.pollLink = document.location.origin + "/#/" + auth.currentUser() + "/polls/" + poll.title;
          $scope.tweetLink = "https://twitter.com/intent/tweet?text=" + 
            encodeURIComponent(poll.title + '? Vote in my poll: ' + $scope.pollLink);
          $scope.urlEncodedLink = encodeURIComponent($scope.pollLink);
        }
    
      }
    ])