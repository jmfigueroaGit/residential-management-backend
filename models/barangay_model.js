const mongoose = require('mongoose');

const GeoSchema = new mongoose.Schema({
	type: {
		type: String,
		default: 'Point',
		enum: ['Point', 'LineString', 'Polygon'],
		required: true,
	},
	coordinates: {
		type: [Number],
		required: true,
	},
});

const barangaySchema = new mongoose.Schema({
	name: {
		type: String,
		require: [true, 'Barangay name field is required'],
		unique: true,
	},
	location: {
		type: GeoSchema,
		required: true,
	},
	adminIds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

// Create a geospatial index on the location field
barangaySchema.index({ location: '2dsphere' });

const Barangay = mongoose.model('Barangay', barangaySchema);

module.exports = Barangay;
