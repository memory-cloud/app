import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Schema defines how the user data will be stored in MongoDB
var AdminSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

// Hash the user's password before saving an user
AdminSchema.pre('save', async function (next) {
	if (this.isModified('password') || this.isNew) {
		let salt = await bcrypt.genSalt(10)
		let hash = await bcrypt.hash(this.password, salt)
		this.password = hash
		next()
	} else {
		return next()
	}
})

AdminSchema.methods.comparePassword = async function (password) {
	if (!await bcrypt.compare(password, this.password)) {
		throw new Error('Wrong password')
	}
}

AdminSchema.statics.findByToken = async function (token) {
	try {
		var teste = await jwt.verify(token, process.env.SECRET)
	} catch (err) {
		return err
	}
	const admin = await this.findOne({_id: teste._id}, {_id: 1})
	if (!admin) {
		return new Error("User not found")
	}
	return admin
}

module.exports = mongoose.model('Admin', AdminSchema)
