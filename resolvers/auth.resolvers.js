const {
	loginUser,
	registerUser,
	getMe,
	logout,
	forgotPassword,
	registerEmail,
	resetPassword,
	verifyResetToken,
} = require('../controllers/auth_controller');
const { isAuthenticated } = require('../middlewares/auth_middleware');

module.exports = {
	Query: {
		auth_logout: isAuthenticated((_, args, context) => {
			return logout(args, context);
		}),
		auth_getMe: isAuthenticated((_, args, context) => {
			return getMe(args, context);
		}),
	},
	Mutation: {
		auth_login: (_, args, context) => {
			return loginUser(args, context);
		},
		auth_register: (_, args) => {
			return registerUser(args);
		},
		auth_verify: (_, args, context) => {
			return registerEmail(args, context);
		},
		auth_forgot_password: (_, args, context) => {
			return forgotPassword(args, context);
		},
		auth_verify_token: (_, args) => {
			return verifyResetToken(args);
		},
		auth_reset_password: (_, args, context) => {
			return resetPassword(args);
		},
	},
};
