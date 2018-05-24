import jwt from 'jsonwebtoken'

exports.resolver = {
	Query: {
		login (db, {email, password}) {
			return db.model('Admin').login(email, password)
		}
	},
	Mutation: {
		async createUser (db, {email, password}) {
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
		changePassword (db, {oldPassword, newPassword}, {admin}) {
			return admin.changePassword(oldPassword, newPassword)
		}
	}
}
