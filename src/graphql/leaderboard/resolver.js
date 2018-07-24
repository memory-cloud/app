import Promise from 'bluebird'
const graph = Promise.promisifyAll(require('fbgraph'))
import check from '@/util/check'

exports.resolver = {
	Query: {
		async LeaderboardGlobal (db, {top, page, key}, {user}) {
			try {
				check(user)
				const leaderboard = await db.model('User').aggregate([
					{$match: {'game': user.game}},
					{$project: {score: '$integers', id: '$fbid'}},
					{$unwind: '$score'},
					{$match: {'score._id': key}},
					{$sort: {'score.value': -1}},
					{$skip: top * (page - 1)},
					{$limit: top},
					{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
				]).cache()

				return leaderboard
			} catch (err) {
				return err
			}
		},
		async LeaderboardFriends (db, {top, page, key}, {user, token}) {
			try {
				check(user)
				graph.setAccessToken(token)
				var result = await graph.getAsync('me/friends?fields=id')
				result.data.push({id: user.fbid})
				const leaderboard = await db.model('User').aggregate([
					{$match: {'fbid': {'$in': result.data.map((player)=>player.id)}}},
					{$project: {score: '$integers', id: '$fbid'}},
					{$unwind: '$score'},
					{$match: {'score._id': key}},
					{$sort: {'score.value': -1}},
					{$skip: top * (page - 1)},
					{$limit: top},
					{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
				])
				return leaderboard
			} catch (err) {
				return err
			}
		},
		async LeaderboardMeFriends (db, {key}, {user, token}) {
			try {
				check(user)
				graph.setAccessToken(token)
				var result = await graph.getAsync('me/friends?fields=id')
				result.data.push({id: user.fbid})
				const leaderboard = await db.model('User').aggregate([
					{$match: {'fbid': {'$in': result.data.map((user)=>user.id)}}},
					{$project: {score: '$integers', id: '$fbid'}},
					{$unwind: '$score'},
					{$match: {'score._id': key}},
					{$sort: {'score.value': -1}},
					{$skip: top * (page - 1)},
					{$limit: top},
					{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
				])
				return leaderboard
			} catch (err) {
				return err
			}
		},
		async LeaderboardMeGlobal (db, {key}, {user}) {
			try {
				check(user)
				const leaderboard = await db.model('User').aggregate([
					{$match: {'game': user.game}},
					{$project: {score: '$integers', id: '$fbid'}},
					{$unwind: '$score'},
					{$match: {'score._id': key}},
					{$sort: {'score.value': -1}},
					{$skip: top * (page - 1)},
					{$limit: top},
					{$project: {'score': '$score.value', 'id': 1, '_id': 0}}
				]).cache()

				return leaderboard
			} catch (err) {
				return err
			}
		},
	}
}
