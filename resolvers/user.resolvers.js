const {
	getAllUsers,
	getSingleUser,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/user_controller.js');

module.exports = {
	Query: {
		users: () => {
			return getAllUsers();
		},
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
