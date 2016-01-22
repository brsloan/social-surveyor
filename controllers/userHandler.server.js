var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

function UserHandler(){
    
    this.register = function(req, res, next){
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
    
    }
    
    this.logIn = function(req,res,next){
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
    }
    
    this.getByName = function(req, res, next, username) {
        var query = User.findOne({username: username});
        
        query.exec(function(err,user){
          if(err){return next(err);}
          if(!user){return next(new Error('can\'t find user'));}
          
          req.user = user;
          return next();
        });
    }
    
}

module.exports = UserHandler;