const {
	getAllBarangays,
	getSingleBarangay,
	createBarangay,
	updateBarangay,
	deleteBarangay,
} = require('../controllers/barangay_controller');
const {
	isAuthenticated,
	requiresRole,
} = require('../middlewares/auth_middleware');

module.exports = {
	Query: {
		barangays: (_, args) => {
			return getAllBarangays(args);
		},
		barangay: (_, args) => {
			return getSingleBarangay(args);
		},
	},
	Mutation: {
		barangay_create: (_, args) => {
			return createBarangay(args);
		},
		barangay_update: requiresRole([1, 2])(
			isAuthenticated((_, args, context) => {
				return updateBarangay(args, context);
			})
		),
		barangay_delete: (_, args) => {
			return deleteBarangay(args);
		},
	},
};
