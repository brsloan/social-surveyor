var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Option = mongoose.model('Option');

function PollHandler(){
    
    this.getUserPolls = function(req, res, next) {
        req.user.populate('polls', function(err,user){
          if(err){return next(err);}
          
          res.json(req.user.polls);
        });
    }
    
    this.getPollByName = function(req, res, next) {
        Poll.findOne({title: req.params.pollname, user: req.user}, function(err,poll){
          if(err){return next(err);}
          if(!poll){return new Error('Couldn\'t find poll.');}
          
          poll.populate('options', function(err,pollWithOps){
          if(err){return next(err)}
          
          res.json(pollWithOps);
          });
        });
    }
    
    this.deletePoll = function(req, res, next) {
        req.poll.populate('options', function(err,poll){
          if(err){return next(err)}
          
          Option.find({poll: poll}).remove(function(err){
            if(err){return next(err);}
            Poll.findById(poll._id).remove(function(err){
              if(err){return next(err);}
              
              res.json(poll);
            });
          });
        });
    }
    
    this.addOptionsToPoll = function(req,res,next){
      var options = req.body;
      
      saveOptions(options, req.poll, next, function(poll,option){
          res.json(option)
      });
      
    }
    
    this.voteOnPoll = function(req, res, next) {
        req.option.voteFor(function(err,option){
          if(err){return next(err);}
          
          res.json(option);
        });
    }
    
    this.saveAPoll = function(req, res, next) {
        if(req.params.user !== req.payload.username){
            return new Error('You cannot post a poll to someone else\'s account.');
        }
      
        var options = req.body.options ? req.body.options.splice(0) : null;
         
        var poll = new Poll(req.body);
        poll.user = req.user;
        
        poll.save(function(err,poll){
          if(err){return next(err);}
          
          req.user.polls.push(poll);
          req.user.save(function(err,user){
            if(err){return next(err);}
            
            if(options){
              saveOptions(options, poll, next, function(newPoll,newOp){
                  res.json(newPoll);
              });
            }
            else{
              res.json(poll);
            }
          });
        });
    }
    
    this.getOptionById = function(req, res, next, id) {
        var query = Option.findById(id);
        
        query.exec(function(err,option){
          if(err){return next(err);}
          if(!option){ return next(new Error('can\'t find option'));}
          
          req.option = option;
          return next();
        });
    }
    
    this.getPollById = function(req, res, next, id) {
        var query = Poll.findById(id);
        
        query.exec(function(err,poll){
          if(err){return next(err);}
          if(!poll){return next(new Error('can\'t find poll'));}
          
          req.poll = poll;
          return next();
        });
    }
    
    function saveOptions(options, poll, next, cb){
        var rawOp = options.shift();
        var option = new Option(rawOp);
        option.poll = poll;
        
        option.save(function(err, option){
          if(err){return next(err);}
          
          poll.options.push(option);
          poll.save(function(err,poll){
            if(err){return next(err);}
            
            if(options.length > 0){
              saveOptions(options, poll, next, cb);
            }
            else{
              cb(poll,option);
            }
          });
        })
      }
        
}

module.exports = PollHandler;