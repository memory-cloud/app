import UserModel from '@/models/user'
import GameModel from '@/models/game'
import AdminModel from '@/models/admin'

import graph from 'fbgraph'

module.exports = async (req, res, next) => {
	const appId = req.headers.appid

	// ADMIN AUTH
	if (!appId) {
		if (!req.headers.admintoken) {
			return next()
		}

		try {
			req.context.admin = await AdminModel.findByToken(req.headers.admintoken)
			return next()
		} catch (err) {
			console.log(err)
			return next()
		}
	}

	// UNITY AUTH
	if (!req.headers.authorization) return next()

	const parts = req.headers.authorization.split(' ')

	if (parts.length !== 2) return res.sendStatus(500)

	const scheme = parts[0]
	const credentials = parts[1]

	if (!/^Bearer$/i.test(scheme)) return res.sendStatus(500)

	const game = await GameModel.findOne({appid: appId}).select('key appid')

	graph.get('debug_token?input_token=' + credentials + '&access_token=' + game.GetAppToken(), async(err, result) => {
		if (err) return res.sendStatus(500)

		const userId = result.data.user_id

		const user = await UserModel.FindOrCreate(userId, game._id)
		if (!user) return res.sendStatus(500)
		req.context.user = user
		req.context.token = credentials

		next()
	})
}
