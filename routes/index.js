var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
//Again, change the above SECRET to .env var matching one in models/User.js

var Poll = mongoose.model('Poll');
var Option = mongoose.model('Option');

router.param('comment',function(req,res,next,id){
  var query = Comment.findById(id);

  query.exec(function(err,comment){
    if(err){return next(err);}
    if(!comment){return next(new Error('can\'t find comment'));}

    req.comment = comment;
    return next();
  });
});

router.param('poll',function(req, res, next, id) {
    var query = Poll.findById(id);
    
    query.exec(function(err,poll){
      if(err){return next(err);}
      if(!poll){return next(new Error('can\'t find poll'));}
      
      req.poll = poll;
      return next();
    });
});

router.param('pollname',function(req, res, next, id) {
    req.pollname = id;
    return next();
})

router.param('option',function(req, res, next, id) {
    var query = Option.findById(id);
    
    query.exec(function(err,option){
      if(err){return next(err);}
      if(!option){ return next(new Error('can\'t find option'));}
      
      req.option = option;
      return next();
    });
});

router.param('user',function(req, res, next, username) {
    var query = User.findOne({username: username});
    
    query.exec(function(err,user){
      if(err){return next(err);}
      if(!user){return next(new Error('can\'t find user'));}
      
      req.user = user;
      return next();
    });
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET all user's polls
router.get('/:user/polls', function(req, res, next) {
    req.user.populate('polls', function(err,user){
      if(err){return next(err);}
      
      res.json(req.user.polls);
    });
});

// GET a poll
router.get('/:user/polls/:pollname', function(req, res, next) {
    Poll.findOne({title: req.pollname, user: req.user}, function(err,poll){
      if(err){return next(err);}
      if(!poll){return new Error('Couldn\'t find poll.');}
      
      poll.populate('options', function(err,pollWithOps){
      if(err){return next(err)}
      
      res.json(pollWithOps);
      });
    });
});

// DELETE a poll
router.delete('/:user/polls/:poll', auth, function(req, res, next) {
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
});

// POST an array of options to a poll
router.post('/:user/polls/:poll/options/', auth, function(req,res,next){
  var options = req.body;
  
  saveOptions(options);
  
  function saveOptions(arr){
    var thisOp = arr.shift();
    var option = new Option(thisOp);
    option.poll = req.poll;
    
    option.save(function(err, option){
      if(err){return next(err);}
      
      req.poll.options.push(option);
      req.poll.save(function(err,poll){
        if(err){return next(err);}
        
        if(arr.length > 0){
          saveOptions(arr);
        }
        else{
          res.json(option);
        }
      });
    })
  }
  
});

// PUT - Vote for a poll
router.put('/:user/polls/:poll/options/:option/votefor', function(req, res, next) {
    req.option.voteFor(function(err,option){
      if(err){return next(err);}
      
      res.json(option);
    });
});

//POST a new poll, with options
router.post('/:user/polls', auth, function(req, res, next) {
    var options = req.body.options ? req.body.options.splice(0) : null;
     
    var poll = new Poll(req.body);
    poll.user = req.user;
    
    //TODO: Check :user against req.payload.username and only add poll if they match.
    
    poll.save(function(err,poll){
      if(err){return next(err);}
      
      req.user.polls.push(poll);
      req.user.save(function(err,user){
        if(err){return next(err);}
        
        if(options){
          saveOptions(options, poll);
        }
        else{
          res.json(poll);
        }
      });
    });
     
     
    function saveOptions(arr, poll){
    var thisOp = arr.shift();
    var option = new Option(thisOp);
    option.poll = poll;
    
    option.save(function(err, option){
      if(err){return next(err);}
      
      poll.options.push(option);
      poll.save(function(err,poll){
        if(err){return next(err);}
        
        if(arr.length > 0){
          saveOptions(arr, poll);
        }
        else{
          res.json(poll);
        }
      });
    })
  }
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function(err){
    if(err){return next(err);}

    return res.json({token: user.generateJWT()});
  });

});

router.post('/login', function(req,res,next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){return next(err);}

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req,res,next);
});

module.exports = router;
