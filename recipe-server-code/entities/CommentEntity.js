const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    recipeId: {
        type: Schema.Types.ObjectId, 
        ref: 'Recipe',
        required: true
    },
    commentator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reactions:[{
        type: Schema.Types.ObjectId, 
        ref: 'Reaction'
    }],
    rating: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: ""
    }
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Comment', commentSchema);
  
