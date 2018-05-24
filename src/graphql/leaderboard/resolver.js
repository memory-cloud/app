import Promise from 'bluebird'
const graph = Promise.promisifyAll(require('fbgraph'))

exports.resolver = {
	Leaderboard: {
		position ({leaderboard}, params, {user}) {
			return leaderboard.map((entry) => entry.id).indexOf(user.fbid) + 1
		},
		score ({leaderboard}, params, {user}) {
			return leaderboard.filter((entry) => entry.id === user.fbid)[0].score
		},
		leaderboard ({leaderboard, top}) {
			return leaderboard.slice(0, top)
		}
	},
	Query: {
		async Leaderboard (db, {top, key}, {user}) {
			const leaderboard = await db.model('User').aggregate([
				{$match: {'game': user.game}},
				{$project: {score: '$integers', id: '$fbid'}},
				{$unwind: '$score'},
				{$match: {'score._id': key}},
				{$sort: {'score.value': -1}},
				{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
			]).cache()

			let response = {}
			response.leaderboard = leaderboard
			response.top = top < 100 && top > 0 ? top : 100
			return response
		},
		async LeaderboardFriends (db, {top, key}, {user, token}) {
			graph.setAccessToken(token)
			try {
				var result = await graph.getAsync('me/friends?fields=id')
			} catch (err) {
				return err
			}
			result.data.push({id: user.fbid})
			const teste = await db.model('User').find({fbid: result.data.map(({id})=> id)}).select('integers fbid')

			let leaderboard = teste.map((user) => {
				let resp = {}
				resp.id = user.fbid
				resp.score = user.integers.id(key).value
				return resp
			})

			const response = {}
			response.leaderboard = leaderboard.sort((a, b) => a.score < b.score)
			response.top = top < 100 && top > 0 ? top : 100
			return response
		},
		async PublicLeaderboard (db, {appid, key, top}) {
			top = top < 100 && top > 0 ? top : 100
			const game = await db.model('Game').findOne({appid: appid}).select('_id')
			return db.model('User').aggregate([
				{$match: {'game': game._id}},
				{$project: {score: '$integers', id: '$fbid'}},
				{$unwind: '$score'},
				{$match: {'score._id': key}},
				{$sort: {'score.value': -1}},
				{$limit: top},
				{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
			]).cache()
		}
	}
}
