const {
	getAllUsers,
	getSingleUser,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/user_controller.js');
const {
	isAuthenticated,
	requiresRole,
} = require('../middlewares/auth_middleware');

module.exports = {
	Query: {
		users: requiresRole([1, 5])(
			isAuthenticated((_, args, context) => {
				return getAllUsers();
			})
		),
		user: (_, args) => {
			return getSingleUser(args);
		},
	},
	Mutation: {
		user_create: (_, args) => {
			return createUser(args);
		},
		user_update: (_, args) => {
			return updateUser(args);
		},
		user_delete: (_, args) => {
			return deleteUser(args);
		},
	},
};
