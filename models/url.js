const mongoose = require('mongoose');
const { Schema } = mongoose;
const autoIncrementID = require('./counter');

const urlSchema = new Schema({
  _id: { type: Number },
  val: { type: String, required: true },
});

urlSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementID('url', this, next);
})

module.exports = mongoose.model('url', urlSchema);
