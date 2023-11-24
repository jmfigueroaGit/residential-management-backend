const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const User = require('../models/user_model.js');
const Resident = require('../models/resident_model');
const bcrypt = require('bcryptjs');

// @desc    Get All Users
// @access  Private || Admin
const getAllUsers = asyncHandler(async (args) => {
	const users = await User.find().populate('resident');
	console.log('fetch');

	return users;
});

// @desc    Get Single User
// @access  Private || Admin
const getSingleUser = asyncHandler(async (args) => {
	const { id } = args;
	const user = await User.findById(id).populate('resident');

	if (user) return user;
	else throw new NotFoundError('User not found with this id');
});

// @desc    Create User
// @access  Private || Admin
const createUser = asyncHandler(async (args) => {
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

// @desc    Update Single User
// @access  Private || Admin
const updateUser = asyncHandler(async (args) => {
	const { id, username, email, password, role, verified } = args;

	const user = await User.findById(id).select('+password');

	if (!user) throw new NotFoundError('User not found with this id');

	const salt = bcrypt.genSaltSync(10);
	let modifiedPassword;

	if (password) {
		modifiedPassword = await bcrypt.hashSync(password, salt);
	}

	const updatedData = {
		username: username || user.username,
		email: email || user.email,
		password: modifiedPassword || user.password,
		role: role || user.role,
		verified: verified || user.verified,
	};

	const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
		new: true,
	})
		.select('+password')
		.populate('resident');

	return updatedUser;
});

// @desc    Delete Single User
// @access  Private || Admin
const deleteUser = asyncHandler(async (args) => {
	const { id } = args;

	const user = await User.findById(id);

	if (!user) throw new NotFoundError('User not found with this id');

	await User.findByIdAndDelete(user._id);

	return { message: 'User removed' };
});

module.exports = {
	getAllUsers,
	getSingleUser,
	createUser,
	updateUser,
	deleteUser,
};
