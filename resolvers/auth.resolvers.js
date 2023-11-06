const {
	loginUser,
	registerUser,
	getMe,
	logout,
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
	},
};
