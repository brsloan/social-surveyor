var mongoose = require('mongoose');

var PollSchema = new mongoose.Schema({
    title: String,
    options: [{type: mongoose.Schema.Types.ObjectId, ref: 'Option'}],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Poll', PollSchema);