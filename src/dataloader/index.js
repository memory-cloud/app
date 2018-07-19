const DataLoader = require('dataloader')
const getUsersById = db => (ids) => db.model('Admin').find({_id: {$in: ids}})
const getAchievementsById = db => (ids) => db.model('Achievement').find({_id: {$in: ids}})

module.exports = db => ({
	userById: new DataLoader(getUsersById(db)),
	achievementById: new DataLoader(getAchievementsById(db))
})