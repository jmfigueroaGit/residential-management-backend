const { GraphQLError } = require('graphql');

class ValidationError extends GraphQLError {
	constructor(message) {
		super(message);
		this.extensions = {
			code: 'VALIDATION_ERROR',
			...this.extensions,
		};
	}
}

class AuthenticationError extends GraphQLError {
	constructor(message) {
		super(message);
		this.extensions = {
			code: 'AUTHENTICATION_ERROR',
			...this.extensions,
		};
	}
}

class NotFoundError extends GraphQLError {
	constructor(message = 'Resource not found') {
		super(message);
		this.extensions = {
			code: 'NOT_FOUND_ERROR',
			...this.extensions,
		};
	}
}

class ForbiddenError extends GraphQLError {
	constructor(message = 'You do not have permission to do this') {
		super(message);
		this.extensions = {
			code: 'FORBIDDEN_ERROR',
			...this.extensions,
		};
	}
}

class InputError extends GraphQLError {
	constructor(message = 'Invalid input') {
		super(message);
		this.extensions = {
			code: 'INPUT_ERROR',
			...this.extensions,
		};
	}
}

module.exports = {
	ValidationError,
	AuthenticationError,
	NotFoundError,
	ForbiddenError,
	InputError,
};
