var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

var path = process.cwd();
var PollHandler = require(path + '/controllers/pollHandler.server.js');
var UserHandler = require(path + '/controllers/userHandler.server.js');
var pollHandler = new PollHandler();
var userHandler = new UserHandler();

router.param('poll', pollHandler.getPollById);
router.param('option', pollHandler.getOptionById);
router.param('user', userHandler.getByName);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:user/polls', pollHandler.getUserPolls);
router.post('/:user/polls', auth, pollHandler.saveAPoll);
router.get('/:user/polls/:pollname', pollHandler.getPollByName);
router.delete('/:user/polls/:poll', auth, pollHandler.deletePoll);
router.post('/:user/polls/:poll/options/', auth, pollHandler.addOptionsToPoll);
router.put('/:user/polls/:poll/options/:option/votefor', pollHandler.voteOnPoll);

router.post('/register', userHandler.register);
router.post('/login', userHandler.logIn);

module.exports = router;