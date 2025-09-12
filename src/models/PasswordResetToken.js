const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	token: { type: String, required: true, index: true, unique: true },
	expires_at: { type: Date, required: true },
	used: { type: Boolean, default: false },
	created_at: { type: Date, default: Date.now }
});

PasswordResetTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
