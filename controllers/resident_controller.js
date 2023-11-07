const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const Resident = require('../models/resident_model');

// @desc    Get All Residents
// @access  Private || Admin
const getAllResident = asyncHandler(async (args) => {
	const residents = await Resident.find();

	return residents;
});

// @desc    Get Single Resident
// @access  Private || Admin
const getSingleResident = asyncHandler(async (args) => {
	const { id } = args;

	const resident = await Resident.findById(id);

	if (!resident) throw new NotFoundError('Resident not found with this id');

	return resident;
});

// @desc    Create Resident
// @access  Private || Admin
const createResident = asyncHandler(async (args, context) => {
	const { user } = context;
	const {
		name,
		sex,
		birthday,
		nationality,
		contactNumber,
		residencyLength,
		occupation,
		address,
		image_url,
	} = args;

	// Find phone number in the Resident's database
	const contactExist = await Resident.findOne({ contactNumber });

	// Check phone number if already existed
	if (contactExist) throw new ValidationError('Phone number is already used.');

	const resident = await Resident.create({
		user,
		name,
		sex,
		birthday,
		nationality,
		contactNumber,
		email: user.email,
		residencyLength,
		occupation,
		address,
		image_url,
	});

	if (!resident) throw new InputError('Invalid data input');

	return resident;
});

// @desc    Update Single Resident
// @access  Private || Admin
const updateResident = asyncHandler(async (args) => {
	const { id } = args;
	const resident = await Resident.findById(id);

	if (!resident) throw new NotFoundError('Resident not found with this id');

	resident.name.first = args.first || resident.name.first;
	resident.name.middle = args.middle || resident.name.middle;
	resident.name.last = args.last || resident.name.last;
	resident.name.extension = args.extension || resident.name.extension;
	resident.sex = args.sex || resident.sex;
	resident.birthday = args.birthday || resident.birthday;
	resident.nationality = args.nationality || resident.nationality;
	resident.contactNumber = args.contactNumber || resident.contactNumber;
	resident.email = args.email || resident.email;
	resident.residencyLength = args.residencyLength || resident.residencyLength;
	resident.address.houseNumber =
		args.houseNumber || resident.address.houseNumber;
	resident.address.street = args.street || resident.address.street;
	resident.address.barangay = args.barangay || resident.address.barangay;
	resident.address.province = args.province || resident.address.province;
	resident.address.city = args.city || resident.address.city;
	resident.address.zipcode = args.zipcode || resident.address.zipcode;
	resident.occupation = args.occupation || resident.occupation;
	resident.image_url = args.image_url || resident.image_url;

	const updatedResident = await resident.save();

	return updatedResident;
});

// @desc    Delete Single Resident
// @access  Private || Admin
const deleteResident = asyncHandler(async (args) => {
	const { id } = args;
	const resident = await Resident.findById(id);
	if (!resident) throw new NotFoundError('Resident not found with this id');

	await Resident.findByIdAndDelete(resident._id);

	return { message: 'Resident removed' };
});

module.exports = {
	getAllResident,
	getSingleResident,
	createResident,
	updateResident,
	deleteResident,
};
