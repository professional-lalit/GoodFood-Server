const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reactionSchema = new Schema({
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true
    },
    reactor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl:{
      type: String,
      required: false
    },
    reactions:[{
      type: Schema.Types.ObjectId, 
      ref: 'Reaction'
    }]
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Reaction', reactionSchema);