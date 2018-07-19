import express from 'express'
import {graphqlExpress} from 'graphql-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import schema from './schema'
import context from 'context-middleware'
import middlewares from '@/middlewares'
import db from '@/config/db'

async function startApp () {
	const app = express()

	// insert context in req
	app.use(context())

	// CORS
	app.use(cors())

	// insert body in req
	// app.use(bodyParser.raw({ type: 'application/memorycloud.custom-type' }))
	app.use(bodyParser.json()) // used for tests with graphiQL app

	// app.use() all middlewares from the folder
	Object.keys(middlewares).map(e => app.use(middlewares[e]))

	// graphql endpoint
	app.use('/graphql',
		graphqlExpress((req) => ({
			schema,
			context: req.context,
			rootValue: db
		}))
	)

	// start server
	app.listen(process.env.PORT, () => console.log('Listening at port', process.env.PORT))
}

startApp()
