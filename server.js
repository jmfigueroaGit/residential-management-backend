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

(async function () {
	dotenv.config();
	const app = express();

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
	await server.start();
	app.use(
		'/graphql',
		cors(),
		express.json(),
		expressMiddleware(server, {
			context: async ({ req }) => ({ token: req.headers.token }),
		})
	);
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	app.use(helmet());
	app.use(morgan('dev'));
	app.use(cookieParser());

	await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
	console.log(`🚀 Server ready at http://localhost:4000/graphql`);
})();
