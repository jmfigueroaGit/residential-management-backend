const {
	getAllResident,
	getSingleResident,
	createResident,
	updateResident,
	deleteResident,
} = require('../controllers/resident_controller');
const {
	isAuthenticated,
	requiresRole,
} = require('../middlewares/auth_middleware');

module.exports = {
	Query: {
		residents: requiresRole([1])(
			isAuthenticated(() => {
				return getAllResident();
			})
		),
		resident: requiresRole([1])(
			isAuthenticated((_, args) => {
				return getSingleResident(args);
			})
		),
	},
	Mutation: {
		resident_create: isAuthenticated((_, args, context) => {
			return createResident(args, context);
		}),
		resident_update: isAuthenticated((_, args, context) => {
			return updateResident(args, context);
		}),
		resident_delete: isAuthenticated((_, args, context) => {
			return deleteResident(args, context);
		}),
	},
};
