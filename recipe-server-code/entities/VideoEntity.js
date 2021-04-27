const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    url:{
        type: String,
        required: false
    },
    thumbUrl:{
        type: String,
        required: false
    },
    creator: {
        type:  Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

module.exports = mongoose.model('Video', videoSchema);

