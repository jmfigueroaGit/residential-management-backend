const asyncHandler = require('express-async-handler');
const {
	InputError,
	NotFoundError,
	ValidationError,
} = require('../utils/error_handler');
const Resident = require('../models/resident_model');
const { isBarangayExists } = require('../middlewares/auth_middleware');
const User = require('../models/user_model');

// @desc    Get All Residents
// @access  Private || Admin
const getAllResident = asyncHandler(async (args) => {
	const residents = await Resident.find().populate('barangay');

	return residents;
});

// @desc    Get Single Resident
// @access  Private || Admin
const getSingleResident = asyncHandler(async (args) => {
	const { id } = args;

	const resident = await Resident.findById(id).populate('barangay');

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
		civilStatus,
		nationality,
		contactNumber,
		contactPerson,
		address,
		background,
		image_url,
	} = args;

	// Find phone number in the Resident's database
	const contactExist = await Resident.findOne({ contactNumber });

	// Check phone number if already existed
	if (contactExist) throw new ValidationError('Phone number is already used.');

	// Use the abstracted function
	// const barangay = await isBarangayExists(barangayId);

	const resident = await Resident.create({
		user,
		name,
		sex,
		birthday,
		civilStatus,
		nationality,
		contactNumber,
		email: user.email,
		contactPerson,
		address,
		background,
		image_url,
	});

	if (!resident) throw new InputError('Invalid data input');

	const isCompletedUser = await User.findById(user._id);

	isCompletedUser.isCompleted = true;
	await isCompletedUser.save({ validateBeforeSave: true });
	return resident.populate('barangay');
});

// @desc    Update Single Resident
// @access  Private || Admin
const updateResident = asyncHandler(async (args) => {
	const { id } = args;
	const resident = await Resident.findById(id);

	if (!resident) throw new NotFoundError('Resident not found with this id');
	// Personal Info
	resident.name.first = args.name.first || resident.name.first;
	resident.name.middle = args.name.middle || resident.name.middle;
	resident.name.last = args.name.last || resident.name.last;
	resident.name.extension = args.name.extension || resident.name.extension;
	resident.sex = args.sex || resident.sex;
	resident.birthday = args.birthday || resident.birthday;
	resident.civilStatus = args.civilStatus || resident.civilStatus;
	resident.nationality = args.nationality || resident.nationality;
	resident.contactNumber = args.contactNumber || resident.contactNumber;
	resident.email = args.email || resident.email;
	// Contact Person
	resident.contactPerson.name =
		args.contactPerson.name || resident.contactPerson.name;
	resident.contactPerson.contactNumber =
		args.contactPerson.contactNumber || resident.contactPerson.contactNumber;
	resident.contactPerson.relationship =
		args.contactPerson.relationship || resident.contactPerson.relationship;
	resident.contactPerson.address =
		args.contactPerson.address || resident.contactPerson.address;
	// Address
	resident.address.houseNumber =
		args.address.houseNumber || resident.address.houseNumber;
	resident.address.street = args.address.street || resident.address.street;
	resident.address.barangay =
		args.address.barangay || resident.address.barangay;
	resident.address.region = args.address.region || resident.address.region;
	resident.address.city = args.address.city || resident.address.city;
	resident.address.zipcode = args.address.zipcode || resident.address.zipcode;
	// Background
	resident.background.employment =
		args.background.employment || resident.background.employment;
	resident.background.highEduAttainment =
		args.background.highEduAttainment || resident.background.highEduAttainment;
	resident.background.isSeniorCitizen =
		args.background.isSeniorCitizen || resident.background.isSeniorCitizen;
	resident.background.isPWD =
		args.background.isPWD || resident.background.isPWD;
	resident.background.isSingleParent =
		args.background.isSingleParent || resident.background.isSingleParent;
	resident.background.isStudent =
		args.background.isStudent || resident.background.isStudent;
	resident.background.residencyLength =
		args.background.residencyLength || resident.background.residencyLength;
	// Other
	resident.image_url = args.image_url || resident.image_url;

	const updatedResident = await resident.save();

	return updatedResident.populate('barangay');
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
