const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const User = require('../models/user_model.js');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generate_token.js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/send_mail.js');

// @desc    Login User
// @access  Public
const loginUser = asyncHandler(async (args, context) => {
	const { username, password } = args;

	const user = await User.findOne({ username }).select('+password');

	if (user && (await user.comparePassword(password))) {
		const token = generateToken(user._id);

		context.res.cookie('auth-token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			secure: true,
		});

		return { user, token };
	} else throw new ValidationError('Username or Password is incorrect');
});

// @desc    Register User
// @access  Public
const registerUser = asyncHandler(async (args) => {
	const { username, email, password, role } = args;

	const usernameExist = await User.findOne({ username });
	const emailExist = await User.findOne({ email });

	if (usernameExist) throw new ValidationError('Username is already used');
	if (emailExist) throw new ValidationError('Email is already used');

	const user = await User.create({
		username,
		email,
		password,
		role,
	});

	if (user) return user;
	else throw new InputError('Invalid data input');
});

// @desc    Logout User
// @access  Private
const logout = asyncHandler(async (args, context) => {
	const { res } = context;

	res.clearCookie('auth-token');

	return { message: 'User logged out' };
});

// @desc     Get current logged in user
// @access  Private
const getMe = asyncHandler(async (args, context) => {
	const { user } = context;

	return user;
});

const verifyEmail = asyncHandler(async (args) => {
	const { email } = args;

	const user = await User.findOne({ email });

	if (!user) {
		throw new NotFoundError(`User not found with this email`);
	}

	// Generate reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: true });

	const message = resetToken;

	try {
		await sendEmail({
			email: user.email,
			subject: 'E-baryo Verify Email',
			message,
		});

		return { message: `Email sent to ${user.email}` };
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });
		throw new ValidationError(error.message);
	}
});

const resetPassword = asyncHandler(async (args) => {
	// Hash URL Token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(args.token)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		throw new ValidationError(
			'Password reset token in invalid or has been expired'
		);
	}

	if (args.password !== args.confirmPassword) {
		throw new InputError('Password doet not match');
	}

	// Setup the new password
	user.password = args.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	return { message: 'Password Updated Successfully' };
});

module.exports = {
	loginUser,
	registerUser,
	logout,
	getMe,
	verifyEmail,
	resetPassword,
};
