import jwt from 'jsonwebtoken'
import check from '@/util/check'

exports.resolver = {
	Query: {
		async login (db, {email, password}) {
			let admin = await db.model('Admin').findOne({email: email}, {password: 1})

			if (!admin) {
				throw new Error('Email not registered')
			}

			try {
				await admin.comparePassword(password)
				admin.password = null
				return jwt.sign(admin.toJSON(), process.env.SECRET)
			} catch (err) {
				return err
			}
		}
	},
	Mutation: {
		async createUser (db, {email, password}) {
			if(process.env.OPEN === 'false') {
				return new Error('Registration is closed')
			}
			if(await db.model('Admin').findOne({email: email})) {
				return new Error('Email already in use')
			}
			try {
				const admin = await db.model('Admin').create({email, password})
				return jwt.sign(admin.toJSON(), process.env.SECRET)
			} catch (err) {
				return err
			}
		},
		async changePassword (db, {oldPassword, newPassword}, {admin}) {
			check(admin)
			try {
				await admin.comparePassword(oldPassword)
				admin.password = newPassword
				await admin.save()
				admin.password = null
				return jwt.sign(this, process.env.SECRET)
			} catch (err) {
				return err
			}
		}
	}
}
