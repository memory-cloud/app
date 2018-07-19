import Mongoose from 'mongoose'
import cachegoose from 'cachegoose'
import models from '@/models'
const options = {
	reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	reconnectInterval: 500, // Reconnect every 500ms
	poolSize: 30, // Maintain up to 10 socket connections
	// If not connected, return errors immediately rather than waiting for reconnect
	bufferMaxEntries: 0
}

Mongoose.connect(process.env.MONGODB_URI, options)
Mongoose.set('debug', true)

Mongoose.set('debug', function (coll, method, query, doc, options) {
	let set = {
		coll: coll,
		method: method,
		query: query,
		doc: doc,
		options: options
	}

	console.log({
		dbQuery: set
	})
})

Object.keys(models).map(model => require('@/models/' + model))

cachegoose(Mongoose, {
	engine: 'redis', /* If you don't specify the redis engine,      */
	port: process.env.REDIS_PORT, /* the query results will be cached in memory. */
	host: process.env.REDIS_HOST,
	compress: true
})

module.exports = Mongoose
