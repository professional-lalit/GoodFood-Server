const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
      type: Number,
      required: true
    },
    imageUrls:{
        type: [String],
        required: false
    },
    videos: {
        type: [Schema.Types.ObjectId],
        ref: 'Video',
        required: false
    },
    creator: {
        type:  Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    avgRating: {
        type: Number,
        default: 0
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: 'Comment',
        required: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ubuntuList: [{
        userId: {
          type: Schema.Types.ObjectId, ref: 'User'
        },
        ubuntuType: {
          type: String,
          required: true
        }
      }]
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Recipe', recipeSchema);

  //ubuntuType: smiley, like, prayer