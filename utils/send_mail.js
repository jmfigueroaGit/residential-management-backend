const nodemailer = require('nodemailer');
const { ValidationError } = require('./error_handler');

const sendEmail = async (options) => {
	const transport = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const message = {
		from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	const info = await transport.sendMail(message);

	console.log('Message sent %s', info.messageId);
};

const sendVerificationEmail = async ({ user, subject, message }) => {
	try {
		let emailRecipient;
		if (user && user.email) {
			emailRecipient = user.email;
		} else {
			throw new Error('User email is required.');
		}
		const result = await sendEmail({
			email: emailRecipient,
			subject: subject || 'E-baryo Verify Email',
			message: message || `E-baryo Verification Message`,
		});
		return result;
	} catch (error) {
		if (user) {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;

			await user.save({ validateBeforeSave: false });
		}

		throw new ValidationError(error.message);
	}
};

module.exports = { sendEmail, sendVerificationEmail };
