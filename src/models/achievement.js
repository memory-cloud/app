import mongoose from 'mongoose'

var AchievementSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	game: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Game',
		required: true
	}
})

AchievementSchema.index({game: 1, title: 1}, {unique: true})

AchievementSchema.statics.FindAchievement = async function (game, id) {
	const achievement = await mongoose.model('Achievement').findOne({game: game, _id: id})

	if (!achievement) {
		return new Error("Achievement not found")
	}

	return achievement

}

module.exports = mongoose.model('Achievement', AchievementSchema)
