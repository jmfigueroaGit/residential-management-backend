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
		user_create: requiresRole([1])(
			isAuthenticated((_, args) => {
				return createUser(args);
			})
		),
		user_update: isAuthenticated((_, args) => {
			return updateUser(args);
		}),
		user_delete: requiresRole([1])(
			isAuthenticated((_, args) => {
				return deleteUser(args);
			})
		),
	},
};
