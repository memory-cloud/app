import Mongoose from 'mongoose'

export default async (db, obj, fields) => {
	return Mongoose.model(db).findOne(obj._id, fields)
}
