const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const {
	AuthenticationError,
	ForbiddenError,
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

module.exports = { isAuthenticated, requiresRole };
