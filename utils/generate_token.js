const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user_model.js');
const { InputError, ValidationError } = require('./error_handler.js');

const generateToken = (id) => {
	const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	return token;
};

const decoded = async (token) => {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const user = await User.findById(decoded.userId).populate('resident');

	return user;
};

const generateDefaultPassword = (defaultString) => {
	try {
		if (!defaultString || typeof defaultString !== 'string') {
			throw new InputError('Invalid input. Please provide a valid string.');
		}

		const token = crypto.randomBytes(20).toString('hex');
		const hashedToken = crypto
			.createHash('sha256')
			.update(defaultString + token)
			.digest('hex');

		return hashedToken;
	} catch (error) {
		throw new ValidationError(`Token generation error: ${error.message}`);
	}
};

module.exports = { generateToken, decoded, generateDefaultPassword };
