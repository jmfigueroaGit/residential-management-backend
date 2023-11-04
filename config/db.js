const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDB'.cyan.underline.bold);
	} catch (err) {
		console.error(`Failed to connect to MongoDB with error: ${err}`);
		process.exit(1); // Exit process with failure
	}
};
module.exports = connectDB;
