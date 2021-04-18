const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true
    },
    mobile:{
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    videoUrl: {
        type: String,
        required: false
    },
    password: {
      type: String,
      required: true
    },
    registrationStatus: {
      type: String,
      default: 'unverified'
    }
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('User', userSchema);