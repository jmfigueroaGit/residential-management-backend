const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const Barangay = require('../models/barangay_model');

// @desc    Get All Barangay
// @access  Private || Admin
const getAllBarangays = asyncHandler(async (args) => {
	const barangays = await Barangay.find();

	return barangays;
});

// @desc    Get Single Barangay
// @access  Private || Admin
const getSingleBarangay = asyncHandler(async (args) => {
	const { barangayId } = args;

	const barangay = await Barangay.findById(barangayId);

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
	});

	return newBarangay;
});

module.exports = { getAllBarangays, getSingleBarangay, createBarangay };
