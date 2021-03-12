const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    }
  },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('Complaint', complaintSchema);