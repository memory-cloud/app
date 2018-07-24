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

module.exports = mongoose.model('Achievement', AchievementSchema)
