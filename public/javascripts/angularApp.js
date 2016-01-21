google.setOnLoadCallback(function () {  
    angular.bootstrap(document.body, ['socialSurveyor']);
});
google.load('visualization', '1', {packages: ['corechart']});

var app = angular.module('socialSurveyor', ['ui.router']);


app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl'
        //resolve: {
          //postPromise: ['polls', function(polls){
            //return polls.getAll();
          //}]
        //}
    })
      .state('polls', {
        url: '/polls',
        templateUrl: '/polls.html',
        controller: 'PollsCtrl'
        //resolve: {
          //postPromise: ['polls', function(polls){
            //return polls.getAll();
          //}]
        //}
    })
    .state('poll', {
        url: '/{username}/polls/{pollname}',
        templateUrl: '/poll.html',
        controller: 'PollCtrl',
        resolve: {
          poll: ['$stateParams', 'polls', function($stateParams, polls){
            return polls.get($stateParams.username, $stateParams.pollname);
          }],
          username: ['$stateParams', function($stateParams){
            return $stateParams.username;
          }]
        }
    })
      .state('posts',{
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts){
            return posts.get($stateParams.id);
          }]
        }
      })
      .state('login',{
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      .state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      .state('test', {
        url: '/test',
        templateUrl: '/test',
        controller: 'TestCtrl'
      })

    $urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http','$window', function($http, $window){
  var auth = {};

  auth.saveToken = function(token){
    $window.localStorage['flapper-news-token'] = token;
  };

  auth.getToken = function(){
    return $window.localStorage['flapper-news-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  }

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    })
  }

  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  }

  auth.logOut = function(){
    $window.localStorage.removeItem('flapper-news-token');
  }

  return auth;
}]);

app.factory('polls', ['$http', 'auth', function($http, auth){
  var o = {
      polls: [],
      newOptions: [{title: ''},{title: ''} ]
  };

  o.getAll = function(){
    return $http.get('/' + auth.currentUser() + '/polls').success(function(data){
      angular.copy(data, o.polls);
    });
  };

  o.create = function(poll, cb){
    return $http.post('/' + auth.currentUser() + '/polls', poll, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.polls.push(data);
      cb(data);
    });
  };

  o.get = function(username, pollname) {
    return $http.get('/' + username + '/polls/' + pollname).then(function(res){
      return res.data;
    });
  }
  
  o.delete = function(id){
    return $http.delete('/' + auth.currentUser() + '/polls/' + id, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
      o.getAll();

      return res.data;
    });
  }
  
  o.addOptions = function(id, options, cb){
    return $http.post('/' + auth.currentUser() + '/polls/' + id + '/options', options, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      cb(data);
    });
  };

  o.voteForOption = function(username, poll, option, cb){
    return $http.put('/' + username + '/polls/' + poll._id + '/options/' + option._id + '/votefor').success(function(data){
        option.votes += 1;
        cb();
      });
  };
  
  o.addEmptyOption = function(){
    o.newOptions.push({title: ''});
  }
  
  o.clearNewOptions = function(){
    o.newOptions.length = 0;
    o.newOptions.push({title:''});
    o.newOptions.push({title:''});
  };

  return o;
}])


app.controller('MainCtrl', [
  '$scope',
  'polls',
  'auth',
  function($scope, polls, auth){
    $scope.options = polls.newOptions;
    $scope.addPoll = function(){
      if(!$scope.title || $scope.title === ''){return;}
      polls.create({
        title: $scope.title.replace(/[^a-zA-Z0-9-_\s]/g, '')
      }, function(poll){
        polls.addOptions(poll._id, $scope.options, polls.clearNewOptions);
        $scope.pollLink = document.location.origin + "/#/" + auth.currentUser() + "/polls/" + poll.title;
        $scope.tweetLink = "https://twitter.com/intent/tweet?text=" + 
          encodeURIComponent(poll.title + '? Vote in my poll: ' + $scope.pollLink);
        $scope.urlEncodedLink = encodeURIComponent($scope.pollLink);
      });
      $scope.title = '';
    };
    $scope.addOption = polls.addEmptyOption;
    $scope.removeOption = function(){
      if(polls.newOptions.length > 2)
        polls.newOptions.pop();
    };
    
    
    $scope.isLoggedIn = auth.isLoggedIn;
  }
])


app.controller('PollsCtrl', [
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

app.controller('PollCtrl', [
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
      polls.voteForOption(username, poll, chosenOption, drawTable);
      localStorage.setItem(poll._id, true);
      $scope.hasVoted = true;
    };
    $scope.isLoggedIn = auth.isLoggedIn();
    $scope.extraOption = {};
    $scope.addOption = function(){
       polls.addOptions(poll._id, [$scope.extraOption], function(newOption){
         poll.options.push({title: newOption.title, _id: newOption._id, votes: 0});
         $scope.extraOption.title = '';
         drawTable();
       });
    };
    
    
    
    drawTable();
    
    function drawTable(){
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

app.controller('PostsCtrl',[
  '$scope',
  'posts',
  'post',
  'auth',
  function($scope,posts,post,auth){
    $scope.post = post;
    $scope.addComment = function(){
      if($scope.body === '') {return;}
      posts.addComment(post._id, {
        body: $scope.body,
        author: 'user',
      }).success(function(comment){
        $scope.post.comments.push(comment);
      })
      $scope.body = '';
    };
    $scope.incrementUpvotes = function(comment){
      posts.upvoteComment(post, comment);
    };
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};

    $scope.register = function(){
      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };

    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };
  }
]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
