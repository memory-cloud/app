import check from '../../util/check'
import populate from '@/util/populate'
import graphqlMongodbProjection from 'graphql-mongodb-projection'

exports.resolver = {
	Query: {
		async Achievements (db, _, {user}, info) {
			check(user)
			let userA = await populate('User', user, 'achievements')
			let achievements = await db.model('Achievement').find({game: user.game}, graphqlMongodbProjection(info))
			if (!userA.achievements) {
				return achievements
			}

			userA.achievements.map(completedAchievement => {
				achievements.find(achievement => achievement._id.equals(completedAchievement._id)).completed = completedAchievement.completed.toUTCString()
			})

			return achievements.sort((a, b) => {
				if (!a.completed) {
					return 1
				} else if (!b.completed) {
					return -1
				}
				return a.completed < b.completed
			})
		}
	},
	Mutation: {
		async CompleteAchievement (db, {title}, {user}) {
			check(user)

			const achievement = await db.model('Achievement').findOne({title: title, game: user.game}, {_id: 1})

			if (!achievement) {
				return new Error('Achievement not found')
			}

			if (user.achievements.id(achievement)) {
				throw new Error('Achievement alredy completed')
			}

			user.achievements.push(achievement)

			await user.save()

			return true
		}
	}
}
