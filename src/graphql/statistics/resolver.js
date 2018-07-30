import check from '@/util/check'
import graphqlMongodbProjection from 'graphql-mongodb-projection'
import db from 'mongoose'

exports.resolver = {
	StatsAchievement: {
		achievement (achievement, _, context, info) {
			try {
				return db.model('Achievement').findOne(achievement._id, graphqlMongodbProjection(info))
			} catch (err) {
				return err
			}
		},
		async completed (achievement) {
			try {
				let count = await db.model('User').aggregate([
					{$match: {'game': achievement.game}},
					{$project: {achievements: '$achievements'}},
					{$unwind: '$achievements'},
					{$match: {'achievements._id': achievement._id}},
					{$count: 'total'}
				]).cache(3600)
				return count[0] ? count[0].total : 0
			} catch (err) {
				return err
			}
		}
	},
	Query: {
		async achievementsCompleted (db, {id}, {admin}) {
			try {
				check(admin)
				const game = await db.model('Game').FindGame(id, admin)
				let achievements = await db.model('Achievement').find({game: game}, {_id: 1, game: 1})
				return achievements
			} catch (err) {
				return err
			}
		}
	}
}
