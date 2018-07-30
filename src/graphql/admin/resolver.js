import graphqlMongodbProjection from 'graphql-mongodb-projection'
import check from '@/util/check'
import db from 'mongoose'

exports.resolver = {
	Game: {
		achievements (game, params, context, info) {
			return db.model('Achievement').find({game: game}, graphqlMongodbProjection(info))
		},
		players (game) {
			return db.model('Game').find({game: game._id}).count()
		}

	},
	Query: {
		me (db, args, {admin, dataloaders}, info) {
			check(admin)
			return db.model('Admin').findOne({_id: admin}, graphqlMongodbProjection(info))
			// return dataloaders.userById.load(admin)
		},
		games (db, args, {admin}, info) {
			check(admin)
			return db.model('Game').find({admin: admin}, graphqlMongodbProjection(info))
		},
		game (db, {appid}, {admin}, info) {
			check(admin)
			return db.model('Game').findOne({admin: admin, appid: appid}, graphqlMongodbProjection(info))
		}

	},
	Mutation: {
		async createGame (db, {game}, {admin}) {
			try {
				check(admin)
				var re = /^[1-9][0-9]*$/
				if (!re.test(game.appid)) {
					throw new Error(game.appid + ' is not a valid Facebook App ID')
				}

				game.admin = admin._id

				return await db.model('Game').create(game)
			} catch (err) {
				return err
			}
		},
		async upsertAchievements (db, {achievements, appid}, {admin}, info) {
			try {
				check(admin)
				var game = await db.model('Game').FindGame(appid, admin)

				let newAchievements = achievements.filter(achievement => !achievement._id)
				let updateAchievements = achievements.filter(achievement => achievement._id)

				if (updateAchievements[0]) { // updateMany
					updateAchievements.map(async (achievement) => db.model('Achievement').update({
						_id: achievement._id,
						game: game._id
					}, achievement))
				}

				if (!newAchievements[0]) {
					return db.model('Achievement').find({game: game}, graphqlMongodbProjection(info))
				}
				newAchievements.map(async (achievement) => {
					achievement.game = game._id
					achievement._id = db.Types.ObjectId()
					game.achievements.push(achievement._id)
				})

				await db.model('Achievement').insertMany(newAchievements)
				await game.save()
				return db.model('Achievement').find({game: game}, graphqlMongodbProjection(info))
			} catch (err) {
				return err
			}
		},
		async deleteAchievement (db, {appid, achievementid}, {admin}, info) {
			try {
				check(admin)

				let game = await db.model('Game').findOne({appid: appid, admin: admin}, {achievements: 1})

				if (!game) {
					throw new Error('Game not found')
				}

				let achievement = await db.model('Achievement').findOneAndDelete({_id: achievementid, game: game}, graphqlMongodbProjection(info))

				if (!achievement) {
					throw new Error('Achievement not found')
				}

				game.achievements.pull(achievement)

				await game.save()

				return achievement
			} catch (err) {
				return err
			}
		}
	}
}
