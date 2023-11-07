const {
	getAllBarangays,
	getSingleBarangay,
	createBarangay,
} = require('../controllers/barangay_controller');

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
	},
};
