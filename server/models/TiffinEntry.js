const mongoose = require('mongoose');

// This is the new schema
const mealSchema = mongoose.Schema({
  time: { type: String, required: true },
  // 'pending' (default), 'taken' (yes), 'skipped' (no)
  status: { type: String, required: true, default: 'pending' }, 
  reason: { type: String } // Optional field for the reason
}, { _id: false });

const tiffinEntrySchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true },
  meals: [mealSchema]
}, { timestamps: true });

// Ensure a user can only have one entry per day
tiffinEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.TiffinEntry || mongoose.model('TiffinEntry', tiffinEntrySchema);