// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  photo: String
});

module.exports = mongoose.model('Post', PostSchema);
