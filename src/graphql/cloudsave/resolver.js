import graphqlMongodbProjection from 'graphql-mongodb-projection'
import check from '@/util/check'
import populate from '@/util/populate'

exports.resolver = {
	Query: {
		Load(db, params, {user}, info) {
			try {
				check(user)
				return db.model('User').findOne({_id: user._id}, graphqlMongodbProjection(info))
			} catch (err) {
				return err
			}
		}
	},
	Mutation: {
		async Save (db, {integers, floats, booleans, strings}, {user}) {
			try {
				check(user)
				let fields = ''
				fields += integers ? 'integers ' : ''
				fields += floats ? 'floats ' : ''
				fields += booleans ? 'booleans ' : ''
				fields += strings ? 'strings' : ''
				user = await populate('User', user, fields)
				if (integers) integers.map(({_id, value}) => user.UpsertInt(_id, value))
				if (floats) floats.map(({_id, value}) => user.UpsertFloat(_id, value))
				if (strings) strings.map(({_id, value}) => user.UpsertString(_id, value))
				if (booleans) booleans.map(({_id, value}) => user.UpsertBool(_id, value))
				await user.save()
				return true
			} catch (err) {
				return false
			}
		}
	}
}
