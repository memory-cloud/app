import AchievementModel from '@/models/achievement'
import UserModel from '@/models/user'
import graphqlMongodbProjection from 'graphql-mongodb-projection'

exports.resolver = {
	Game: {
		achievements (game, params, context, info) {
			return AchievementModel.find({game: game}, graphqlMongodbProjection(info))
		},
		players (game) {
			return UserModel.find({game: game._id}).count()
		}

	},
	Query: {
		me (db, args, {admin, dataloaders}, info) {
			// return db.model('Admin').findOne({_id: admin}, graphqlMongodbProjection(info))
			return dataloaders.userById.load(admin)
		},
		games (db, args, {admin}, info) {
			return db.model('Game').find({admin: admin}, graphqlMongodbProjection(info))
		},
		game (db, {appid}, {admin}, info) {
			return db.model('Game').findOne({admin: admin, appid: appid}, graphqlMongodbProjection(info))
		},

	},
	Mutation: {
		async createGame (db, {game}, {admin}) {
			var re = /^[1-9][0-9]*$/
			if (!re.test(game.appid)) {
				return new Error(game.appid + ' is not a valid Facebook App ID')
			}

			if (await db.model('Game').findOne({appid: game.appid})) {
				return new Error('Game already registered')
			}

			game.admin = admin._id

			try {
				await db.model('Game').create(game)
			} catch (err) {
				return err
			}
		},
		async upsertAchievements(db, {achievements, appid}, {admin}) {
			var game = await db.model('Game').FindGame(appid, admin)
			return game.UpsertAchievements(achievements)
		},
		async deleteAchievement(db, {appid, achievementid}, {admin}) {
			try {
				let game = await db.model('Game').FindGame(appid, admin)

				let achievement = await db.model('Achievement').findOneAndDelete({_id: achievementid, game: game})

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