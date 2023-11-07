const mongoose = require('mongoose');
const slugify = require('slugify');

const residentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			first: {
				type: String,
				required: true,
			},
			middle: {
				type: String,
			},
			last: {
				type: String,
				required: true,
			},
			extension: {
				type: String,
			},
		},
		sex: {
			type: String,
			required: [true, 'Sex field is required'],
			enum: ['male', 'female'],
		},
		birthday: {
			type: String,
			required: [true, 'Birthday field is required'],
		},
		nationality: {
			type: String,
			required: [true, 'Nationality field is required'],
		},
		contactNumber: {
			type: String,
			required: [true, 'Contact number field is required'],
		},
		email: {
			type: String,
			required: [true, 'Email field is required'],
		},
		residencyLength: {
			type: String,
			required: true,
			default: '1',
		},
		slug: {
			type: String,
			unique: true,
		},
		occupation: {
			type: String,
			default: 'none',
		},
		address: {
			houseNumber: { type: String, required: true },
			street: { type: String, required: true },
			barangay: { type: String, required: true },
			province: { type: String, required: true },
			city: { type: String, required: true },
			zipcode: { type: String, required: true },
		},
		image_url: String,
	},
	{
		timestamps: true,
	}
);

residentSchema.pre('save', async function (next) {
	let fullName = `${this.name.first} ${this.name.middle || ''} ${
		this.name.last
	} ${this.name.extension || ''}`;

	this.slug = slugify(fullName, { lower: true, strict: true });

	let slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	this.constructor
		.find({ slug: slugRegEx })
		.then((docs) => {
			if (docs.length) {
				// If a document with the same slug already exists, add a number to differentiate
				this.slug = `${this.slug}-${docs.length + 1}`;
			}
			next();
		})
		.catch((err) => {
			next(err);
		});
});

const Resident = mongoose.model('Resident', residentSchema);

module.exports = Resident;
