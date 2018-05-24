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

GameSchema.methods.UpsertAchievements = async function (achievements) {
	let newAchievements = achievements.filter(achievement => !achievement._id)
	const updateAchievements = achievements.filter(achievement => achievement._id)

	if (updateAchievements[0]){
		updateAchievements.map(async(achievement) => await mongoose.model('Achievement').update({
			_id: achievement._id,
			game: this._id
		}, achievement))
	}

	if (!newAchievements[0]) {
		return mongoose.model('Achievement').find({_id: this.achievements})
	}
	newAchievements.map(async(achievement) => {
		achievement.game = this._id
		achievement._id = mongoose.Types.ObjectId()
		this.achievements.push(achievement._id)
	})

	await mongoose.model('Achievement').insertMany(newAchievements)
	await this.save()
	return mongoose.model('Achievement').find({_id: this.achievements})
}

GameSchema.methods.GetAppToken = function () {
	return this.appid + '|' + this.key
}

GameSchema.statics.FindGame = async function (appid, admin) {
	const game = await mongoose.model('Game').findOne({appid: appid, admin: admin})

	if (!game) {
		return new Error("Game not found")
	}

	return game

}

module.exports = mongoose.model('Game', GameSchema)
