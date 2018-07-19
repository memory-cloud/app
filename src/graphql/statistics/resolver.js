import AchievementModel from '@/models/achievement'
import UserModel from '@/models/user'

exports.resolver = {
	StatsAchievement: {
		achievement (achievement) {
			return AchievementModel.findOne({_id: achievement._id})
		},
		async completed (achievement) {
			let count = await UserModel.aggregate([
				{$match: {'game': achievement.game}},
				{$project: {achievements: '$achievements'}},
				{$unwind: '$achievements'},
				{$match: {'achievements._id': achievement._id}},
				{$count: "total"}
			])
			return count[0] ? count[0].total : 0
		}
	},
	Query: {
		async achievementsCompleted (db, {id}, {admin}) {
			try {
				const game = await db.model('Game').findOne({appid: id})
				let achievements = await db.model('Achievement').find({game: game})
				return achievements
			} catch (err) {
				return err
			}

		}
	}
}