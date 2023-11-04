const {
	getAllResident,
	getSingleResident,
	createResident,
	updateResident,
	deleteResident,
} = require('../controllers/resident_controller');

module.exports = {
	Query: {
		residents: () => {
			return getAllResident();
		},
		resident: (_, args) => {
			return getSingleResident(args);
		},
	},
	Mutation: {
		resident_create: (_, args) => {
			return createResident(args);
		},
		resident_update: (_, args) => {
			return updateResident(args);
		},
		resident_delete: (_, args) => {
			return deleteResident(args);
		},
	},
};
