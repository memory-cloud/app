import AdminModel from '@/models/admin'
import dataloaders from '@/dataloader'
import Mongoose from 'mongoose'

module.exports = async (req, res, next) => {
	if (!req.headers.authorization) return next()

	const parts = req.headers.authorization.split(' ')

	if (parts.length !== 2) return res.sendStatus(500)

	const scheme = parts[0]
	const credentials = parts[1]
	switch (scheme) {
	case 'admin':
		try {
			req.context.admin = await AdminModel.findByToken(credentials)
			req.context.dataloaders = dataloaders(Mongoose)
			return next()
		} catch (err) {
			console.log(err)
			return res.sendStatus(500)
		}
	break
	default:
		next()
	}
}
