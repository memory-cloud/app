// @flow

import dataloaders from '@/dataloader'
import Mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'

module.exports = async (req: Request, res: Response, next: NextFunction): NextFunction => {
	if (!req.headers.authorization) return next()

	const parts = req.headers.authorization.split(' ')

	if (parts.length !== 2) return res.sendStatus(500)

	const scheme = parts[0]
	const credentials = parts[1]
	switch (scheme) {
	case 'admin':
		try {
			req.context.admin = await Mongoose.model('Admin').findByToken(credentials)
			req.context.dataloaders = dataloaders(Mongoose)
			next()
		} catch (err) {
			console.log(err)
			return res.sendStatus(500)
		}
		break
	default:
		next()
	}
}
