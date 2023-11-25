const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const {
	ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');

const { loadFilesSync } = require('@graphql-tools/load-files');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const connectDB = require('./config/db.js');
const {
	ValidationError,
	AuthenticationError,
	NotFoundError,
	ForbiddenError,
	InputError,
} = require('./utils/error_handler.js');
const { decoded } = require('./utils/generate_token.js');

(async function () {
	dotenv.config();
	const app = express();
	app.use(cookieParser());

	connectDB();
	const typeDefs = loadFilesSync(path.join(__dirname, '**/*.graphql'));
	const resolvers = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'));

	const schema = makeExecutableSchema({
		typeDefs,
		resolvers,
	});
	const httpServer = createServer(app);
	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		formatError: (error) => {
			if (error.originalError instanceof ValidationError) {
				return {
					message: error.message,
					code: error.originalError.extensions.code,
				};
			}

			if (error.originalError instanceof AuthenticationError) {
				return {
					message: error.message,
					code: error.originalError.extensions.code,
				};
			}
			if (error.originalError instanceof NotFoundError) {
				return {
					message: error.message,
					code: 'NOT_FOUND_ERROR',
				};
			}
			if (error.originalError instanceof ForbiddenError) {
				return {
					message: error.message,
					code: 'FORBIDDEN_ERROR',
				};
			}
			if (error.originalError instanceof InputError) {
				return {
					message: error.message,
					code: 'INPUT_ERROR',
				};
			}
			return error;
		},
	});

	const corsOptions = {
		origin: true, // Allow requests from this origin
		credentials: true, // Allow sending cookies
	};
	await server.start();
	app.use(
		'/graphql',
		cookieParser(),
		cors(corsOptions),
		express.json(),
		express.urlencoded({ extended: true }),
		expressMiddleware(server, {
			context: async ({ req, res }) => {
				let user = null;

				const token = req.cookies['auth-token'];
				if (token) {
					try {
						// Verify and decode the token
						user = await decoded(token);
					} catch (error) {
						// Handle specific types of token errors
						if (error.name === 'TokenExpiredError') {
							throw new Error('Your session has expired. Please log in again.');
						} else if (error.name === 'JsonWebTokenError') {
							throw new Error('Invalid token. Please log in again.');
						} else {
							// Handle other kinds of unexpected errors
							throw new Error('Authentication error.');
						}
					}
				}

				// Always return req and res, along with the user if they're authenticated
				return { req, res, user };
			},
		}),
		morgan('dev'),
		helmet()
	);

	await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
	console.log(`🚀 Server ready at http://localhost:4000/graphql`);
})();
