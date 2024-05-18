const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema ({
    name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  properties: {
    type: Map,
    of: String,
  },
  unsubscribed: { type: Boolean, default: false },
})
module.exports = mongoose.model('User', User);

const listSchema = new Schema({
    title: { type: String, required: true },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  });
  
module.exports = mongoose.model('List', listSchema);

const propertySchema = new Schema({
    title: { type: String, required: true },
    defaultValue: { type: String, required: true },
  });
  
  module.exports = mongoose.model('Property', propertySchema);