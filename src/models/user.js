// @flow

import mongoose from 'mongoose'

export type UserType = {
    _id: string,
    fbid: string,
    gid: string,
    game: any,
    integers: [],
    floats: [],
    strings: [],
    booleans: [],
    achievements: []
};

const UserSchema = new mongoose.Schema({
	fbid: {
		type: String,
		index: true,
		unique: true
	},
	gid: {
		type: String,
		index: true,
		unique: true
	},
	game: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Game',
		required: true
	},
	strings: [{
		_id: {
			type: String,
			index: true,
			required: true
		},
		value: {
			type: String,
			required: true
		}
	}],
	integers: [{
		_id: {
			type: String,
			index: true,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	}],
	booleans: [{
		_id: {
			type: String,
			index: true,
			required: true
		},
		value: {
			type: Boolean,
			required: true
		}
	}],
	floats: [{
		_id: {
			type: String,
			index: true,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	}],
	achievements: [{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Achievement',
			required: true
		},
		completed: {
			type: Date,
			default: Date.now
		}
	}]
}, {
	timestamps: true
})

UserSchema.statics.FindOrCreate = async function (fbid: string, game: any): Promise<UserType> {
	try {
		let user = await this.findOne({fbid: fbid}, {_id: 1})
		if (!user) {
			user = await this.create({fbid: fbid, game: game})
		}

		return user
	} catch (err) {
		return err
	}
}

UserSchema.statics.FindOrCreateGoogle = async function (gid: string, game: any): Promise<UserType> {
	try {
		let user = await this.findOne({gid: gid}, {_id: 1})
		if (!user) {
			user = await this.create({gid: gid, game: game})
		}

		return user
	} catch (err) {
		return err
	}
}

UserSchema.methods.UpsertString = async function (key: string, value: string): Promise<void> {
	try {
		this.strings.id(key).value = value
	} catch (err) {
		this.strings.push({_id: key, value: value})
	}
}

UserSchema.methods.UpsertInt = async function (key: string, value: number): Promise<void> {
	try {
		this.integers.id(key).value = value
	} catch (err) {
		this.integers.push({_id: key, value: value})
	}
}

UserSchema.methods.UpsertBool = async function (key: string, value: boolean): Promise<void> {
	try {
		this.booleans.id(key).value = value
	} catch (err) {
		this.booleans.push({_id: key, value: value})
	}
}

UserSchema.methods.UpsertFloat = async function (key: string, value: number): Promise<void> {
	try {
		this.floats.id(key).value = value
	} catch (err) {
		this.floats.push({_id: key, value: value})
	}
}

module.exports = mongoose.model('User', UserSchema)
