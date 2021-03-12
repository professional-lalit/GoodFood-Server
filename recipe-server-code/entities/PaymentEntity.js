const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    payerId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    recipeId: {
        type: Schema.Types.ObjectId, 
        ref: 'Recipe',
        required: true
    },
    price: {
        type: Number,
        required: true
    }
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Payment', paymentSchema);
