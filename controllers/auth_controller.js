const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
	ForbiddenError,
} = require('../utils/error_handler');
const User = require('../models/user_model.js');
const bcrypt = require('bcryptjs');
const {
	generateToken,
	generateDefaultPassword,
} = require('../utils/generate_token.js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail, sendVerificationEmail } = require('../utils/send_mail.js');
const extractUsernameFromEmail = require('../utils/extract_email.js');

// @desc    Login User
// @access  Public
const loginUser = asyncHandler(async (args, context) => {
	const { email, password } = args;

	const user = await User.findOne({ email }).select('+password');

	if (user && (await user.comparePassword(password))) {
		const token = generateToken(user._id);

		context.res.cookie('auth-token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			secure: true,
		});

		return { user, token };
	} else throw new ValidationError('Email or Password is incorrect');
});

// @desc    Register Email
// @access  Public
const registerEmail = asyncHandler(async (args, context) => {
	const { email } = args;

	const emailExisted = await User.findOne({ email });

	if (emailExisted) {
		throw new InputError('Email is already used.');
	}

	const password = generateDefaultPassword(email);
	const username = extractUsernameFromEmail(email);

	const user = await User.create({
		email,
		password,
		username,
	});

	// Generate reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: true });
	try {
		const verificationSubject = 'E-baryo Verification Email';
		const verificationMessage = `E-baryo Verification Message ${resetToken}`;

		await sendVerificationEmail({
			user,
			subject: verificationSubject,
			message: verificationMessage,
		});

		return { message: `Email sent to ${user.email}` };
	} catch (error) {
		throw new InputError(error.message);
	}
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
	console.log(context);
	const { user } = context;

	return user;
});

const forgotPassword = asyncHandler(async (args) => {
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

// @desc    Verify Token
// @access  Private
const verifyResetToken = asyncHandler(async (args) => {
	const { token } = args;

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
		throw new ForbiddenError(
			'Password reset token in invalid or has been expired'
		);
	}

	return { message: 'Valid token' };
});

// @desc   	Reset Password
// @access  Private
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
		throw new ForbiddenError(
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
	registerEmail,
	registerUser,
	logout,
	getMe,
	forgotPassword,
	verifyResetToken,
	resetPassword,
};
