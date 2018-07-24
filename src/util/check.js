export default (user) => {
	if (!user) {
		throw new Error('Permission denied')
	}
}
