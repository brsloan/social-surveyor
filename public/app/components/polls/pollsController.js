angular.module('socialSurveyor')
    .controller('PollsCtrl', [
      '$scope',
      'polls',
      'auth',
      function($scope, polls, auth){
        polls.getAll();
        $scope.polls = polls.polls;
        $scope.deletePoll = polls.delete;
        $scope.currentUser = auth.currentUser();
        
        $scope.isLoggedIn = auth.isLoggedIn;
      }
    ])