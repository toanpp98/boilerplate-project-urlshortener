const mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema({
  _id: { type: String, required: true },
  val: { type: Number, default: 0 },
});

counterSchema.index({ _id: 1, val: 1 }, { unique: true });

const counterModel = mongoose.model('counter', counterSchema);

const autoIncrementID = (modelName, doc, next) => {
  counterModel.findByIdAndUpdate(
    modelName,
    { $inc: { val: 1 } },
    { new: true, upsert: true },
    (err, counter) => {
      if (err) {
        next(err);
        return;
      }

      doc._id = counter.val;
      next();
    },
  );
};

module.exports = autoIncrementID;
