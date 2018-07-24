import UserModel from '@/models/user'
import AdminModel from '@/models/admin'

import graph from 'fbgraph'
import dataloaders from '@/dataloader'
import Mongoose from 'mongoose'

module.exports = async (req, res, next) => {
	const appId = req.headers.appid

	if (!req.headers.authorization) return next()

	const parts = req.headers.authorization.split(' ')

	if (parts.length !== 2) return res.sendStatus(500)

	const scheme = parts[0]
	const credentials = parts[1]
	switch (scheme) {
	case 'Player':
	case 'player':
		const game = await Mongoose.model('Game').findOne({appid: appId}, {key: 1})

		if (!game) res.sendStatus(500)

		graph.get('debug_token?input_token=' + credentials + '&access_token=' + appId + '|' + game.key, async (err, result) => {
			if (err) return res.sendStatus(500)
			const userId = result.data.user_id
			try {
				const user = await UserModel.FindOrCreate(userId, game._id)
				if (!user) return res.sendStatus(500)
				user.game = game._id
				user.fbid = userId
				req.context.user = user
				req.context.token = credentials
				req.context.dataloaders = dataloaders(Mongoose)
				return next()
			} catch (err) {
				console.log(err)
				return res.sendStatus(500)
			}
		})
		break
	case 'Admin':
	case 'admin':
		try {
			req.context.admin = await AdminModel.findByToken(credentials)
			req.context.dataloaders = dataloaders(Mongoose)
			return next()
		} catch (err) {
			console.log(err)
			return res.sendStatus(500)
		}
	default:
		return res.sendStatus(500)
	}
}
