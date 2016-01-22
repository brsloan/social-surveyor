angular.module('socialSurveyor')
    .factory('chart', function() {
      var o = {};
      o.drawExample = drawExample;
      o.drawFromPoll = drawFromPoll;
      return o;
      
      function drawExample(){
          var examplePoll = {
                title: 'Best Western',
                options: [{ title: 'The Good The Bad and The Ugly',
                          votes: 253 },
                        { title: 'Unforgiven',
                          votes: 225 },
                        { title: 'Django Unchained',
                          votes: 157 },
                        { title: 'Outlaw Josey Wales',
                          votes: 100 },
                        { title: 'True Grit - Coen Bros',
                          votes: 78 }]
            };
            drawFromPoll(examplePoll);
      }
      
      function drawFromPoll(poll){
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
    
            var options = {'title':poll.title + '?',
                           'legend': 'none',
                           'vAxis': {maxValue: maxVotes ? maxVotes : 10, minValue: 0}
                           
            };
    
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(data, options);
      }
      
    });