const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, 'Username field is required'],
			unique: true,
		},
		email: {
			type: String,
			required: [true, 'Email field is required'],
			validator: [validator.isEmail, 'Please enter valid email address'],
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'Password field is required'],
			select: false,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		role: {
			type: Number,
			default: 5,
		},
		notification: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		timestamps: true,
	}
);

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = bcrypt.genSaltSync(10);
	this.password = await bcrypt.hashSync(this.password, salt);
});

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash and set resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Calculate the current time in milliseconds
	const currentTime = Date.now();

	// Calculate the time for 2 days (48 hours) in milliseconds
	const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;

	// Add 2 days to the current time to get the expiration time
	this.resetPasswordExpire = currentTime + twoDaysInMilliseconds;
	return resetToken;
};

userSchema.virtual('resident', {
	ref: 'Resident',
	localField: '_id',
	foreignField: 'user',
	justOne: true,
});

// Make sure to set the `toObject` and `toJSON` schema options to `true`.
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
