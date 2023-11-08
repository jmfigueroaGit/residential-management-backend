const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
	ForbiddenError,
} = require('../utils/error_handler');
const Barangay = require('../models/barangay_model');
const { isAdminInclude } = require('../middlewares/auth_middleware');

// @desc    Get All Barangay
// @access  Private || Admin
const getAllBarangays = asyncHandler(async (args) => {
	const barangays = await Barangay.find().populate('adminIds');

	return barangays;
});

// @desc    Get Single Barangay
// @access  Private || Admin
const getSingleBarangay = asyncHandler(async (args) => {
	const { barangayId } = args;

	const barangay = await Barangay.findById(barangayId).populate('adminIds');

	if (!barangay) {
		throw new NotFoundError('Barangay not found with this id');
	}

	return barangay;
});

// @desc    Create Barangay
// @access  Private || Admin
const createBarangay = asyncHandler(async (args) => {
	const { name, location } = args;

	const nameExist = await Barangay.findOne({ name });

	if (nameExist) {
		throw new ValidationError('Barangay Name is already used');
	}

	const newBarangay = await Barangay.create({
		name,
		location,
	}).populate('adminIds');

	return newBarangay;
});

// @desc    Create Barangay
// @access  Private || Admin
const updateBarangay = asyncHandler(async (args, context) => {
	const { user } = context;
	const { barangayId, name, location, adminIds } = args;

	const barangay = await isAdminInclude(user, barangayId);

	barangay.name = name || barangay.name;
	barangay.location = location || barangay.location;
	barangay.adminIds = adminIds || barangay.adminIds;

	const updatedBarangay = await barangay.save();

	return updatedBarangay.populate('adminIds');
});

// @desc    Delete Barangay
// @access  Private || Admin
const deleteBarangay = asyncHandler(async (args) => {
	const { barangayId } = args;

	const barangay = await Barangay.findById(barangayId);

	if (!barangay) throw new NotFoundError('Barangay not found with this id');

	await Barangay.findByIdAndDelete(barangay._id);

	return { message: 'Barangay removed' };
});

module.exports = {
	getAllBarangays,
	getSingleBarangay,
	createBarangay,
	updateBarangay,
	deleteBarangay,
};
