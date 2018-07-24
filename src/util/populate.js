import Mongoose from 'mongoose'

export default async (db, obj, fields) => {
    return await Mongoose.model(db).findOne(obj._id, fields)
}