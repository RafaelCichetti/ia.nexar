const mongoose = require('mongoose');

const PasswordResetPinSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pin: { type: String, required: true }, // 8 dígitos em string
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

PasswordResetPinSchema.index({ user_id: 1, used: 1 });
PasswordResetPinSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetPin', PasswordResetPinSchema);
