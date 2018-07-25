import mongoose from 'mongoose'

const GameSchema = new mongoose.Schema({
	appid: {
		type: String,
		unique: true,
		required: true
	},
	key: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	gappid: {
		type: String,
		unique: true
		// required: true
	},
	gappkey: {
		type: String
		// required: true
	},
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Admin',
		required: true
	},
	achievements: [{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Achievement'
		}
	}]
}, {
	timestamps: true
})

GameSchema.statics.FindGame = async function (appid, admin) {
	const game = await mongoose.model('Game').findOne({appid: appid, admin: admin})

	if (!game) {
		throw new Error('Game not found')
	}

	return game
}

module.exports = mongoose.model('Game', GameSchema)
