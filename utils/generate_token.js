const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user_model.js');

const generateToken = (id) => {
	const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	return token;
};

const decoded = async (token) => {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const user = await User.findById(decoded.userId);

	return user;
};

module.exports = { generateToken, decoded };
