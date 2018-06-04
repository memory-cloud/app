import Promise from 'bluebird'
const graph = Promise.promisifyAll(require('fbgraph'))

exports.resolver = {
	LeaderboardBirb: {
		position ({leaderboard}, params, {user}) {
			return leaderboard.map((entry) => entry.id).indexOf(user.fbid) + 1
		},
		leaderboard ({leaderboard, top}) {
			return leaderboard.slice(0, top)
		}
	},
	Query: {
		async GetLeaderboardBirb (db, {top}, {user}) {
			const leaderboard = await db.model('User').aggregate([
				{$match: {'game': user.game}},
				{$project: {score: '$floats', id: '$fbid', mult: '$integers'}},
				{$unwind: '$score'},
				{$match: {'score._id': 'currentSeed'}},
				{$unwind: '$mult'},
				{$match: {'mult._id': 'currentSeedMult'}},
				{$project: {'seed': '$score.value', 'id': 1, '_id': 0, 'multiplier': '$mult.value'}},
				{$sort: {'multiplier': -1, 'seed': -1}}
			]).cache()
			let response = {}
			response.leaderboard = leaderboard
			response.top = top < 100 && top > 0 ? top : 100
			return response
		},
		async GetLeaderboardBirbFriends (db, {top}, {user, token}) {
			graph.setAccessToken(token)
			try {
				const result = await graph.getAsync('me/friends?fields=id')
				result.data.push({id: user.fbid})
				const leaderboard = await db.model('User').aggregate([
					{$match: {'fbid': {'$in': result.data.map((user) => user.id)}}},
					{$project: {score: '$floats', id: '$fbid', mult: '$integers'}},
					{$unwind: '$score'},
					{$match: {'score._id': 'currentSeed'}},
					{$unwind: '$mult'},
					{$match: {'mult._id': 'currentSeedMult'}},
					{$project: {'seed': '$score.value', 'id': 1, '_id': 0, 'multiplier': '$mult.value'}},
					{$sort: {'multiplier': -1, 'seed': -1}}
				])
				return {
					leaderboard: leaderboard,
					top: top < 100 && top > 0 ? top : 100
				}
			} catch (err) {
				return err
			}
		}
	}
}
