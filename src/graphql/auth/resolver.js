// @flow

import jwt from 'jsonwebtoken'
import check from '@/util/check'

type ContextType = {
    user: any,
    admin: any
};

type UserType = {
    email: string,
    password: string
};

type NewPasswordType = {
    oldPassword: string,
    newPassword: string
};

exports.resolver = {
	Query: {
		async login (db: any, {email, password}: UserType): Promise<string> {
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
		async createUser (db: any, {email, password}: UserType): Promise<string> {
			try {
				if (process.env.OPEN === 'false') {
					throw new Error('Registration is closed')
				}
				if (await db.model('Admin').findOne({email: email})) {
					throw new Error('Email already in use')
				}
				const admin = await db.model('Admin').create({email, password})
				admin.password = null
				return jwt.sign(admin.toJSON(), process.env.SECRET)
			} catch (err) {
				return err
			}
		},
		async changePassword (db: any, {oldPassword, newPassword}: NewPasswordType, {admin}: ContextType): Promise<string> {
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
