const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Barangay = require('../models/barangay_model');
const {
	AuthenticationError,
	ForbiddenError,
	NotFoundError,
} = require('../utils/error_handler');

// Authentication Middleware
const isAuthenticated = (resolver) => {
	return (parent, args, context, info) => {
		if (!context.user) {
			throw new AuthenticationError('You must be authenticated!');
		}
		return resolver(parent, args, context, info);
	};
};

// Authorization Middleware
const requiresRole = (allowedRoles) => {
	return (resolver) => {
		return (parent, args, context, info) => {
			if (!allowedRoles.includes(context.user.role)) {
				throw new ForbiddenError('You do not have the required permissions!');
			}

			return resolver(parent, args, context, info);
		};
	};
};

// Function to check if a barangay exists
const isBarangayExists = async (barangayId) => {
	const barangay = await Barangay.findById(barangayId);

	if (!barangay) {
		throw new NotFoundError('Barangay does not exist');
	}

	return barangay;
};

// Authorization for barangay security
const isAdminInclude = async (user, barangayId) => {
	const barangay = await Barangay.findById(barangayId);

	if (!barangay) {
		throw new NotFoundError('Barangay not found with this id');
	}

	if (user.role !== 1 && !barangay.adminIds.includes(user._id)) {
		throw new ForbiddenError('You do not have the required permissions!');
	}

	return barangay;
};

module.exports = {
	isAuthenticated,
	requiresRole,
	isBarangayExists,
	isAdminInclude,
};
