const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const User = require('../models/user_model.js');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generate_token.js');
const jwt = require('jsonwebtoken');

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

	// res.cookie('auth-token', '', {
	// 	expires: new Date(Date.now() + 10 * 1000),
	// 	httpOnly: true,
	// });

	res.clearCookie('auth-token');

	return { message: 'User logged out' };
});

// @desc     Get current logged in user
// @access  Private
const getMe = asyncHandler(async (args, context) => {
	const { user } = context;

	return user;
});

module.exports = { loginUser, registerUser, logout, getMe };
