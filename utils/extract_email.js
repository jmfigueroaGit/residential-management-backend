const extractUsernameFromEmail = (email) => {
	try {
		if (!email || typeof email !== 'string') {
			throw new Error('Invalid email. Please provide a valid email address.');
		}

		const atIndex = email.indexOf('@');
		if (atIndex === -1) {
			throw new Error('Invalid email format. Missing "@" symbol.');
		}

		const username = email.slice(0, atIndex);
		return username;
	} catch (error) {
		throw new Error(`Error extracting username: ${error.message}`);
	}
};

module.exports = extractUsernameFromEmail;
