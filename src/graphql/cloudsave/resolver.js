exports.resolver = {
	Query: {
		Load(db, params, {user}) {
			return user
		}
	},
	Mutation: {
		async Save (db, {integers, floats, booleans, strings}, {user}) {
			try {
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
