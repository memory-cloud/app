// const { Issuer } = require('openid-client')
var jwt = require('jsonwebtoken')

exports.resolver = {
	Query: {
		async Test (db, {idtoken, clientid, clientsecret}) {
			try {
				// check token before
				var user = jwt.decode(idtoken)
				console.log(user)
				// issuer = Issuer.discover('https://accounts.google.com') // => Promise
				// 	.then(function (googleIssuer) {
				// 		const client = new googleIssuer.Client({
				// 			client_id: clientid,
				// 			client_secret: clientsecret
				// 		})
				// 		client.userinfo(idtoken) // => Promise
				// 			.then(function (userinfo) {
				// 				console.log('userinfo %j', userinfo)
				// 			})
				// 	})

				// const client = new OAuth2Client(clientid, clientsecret)
				//
				// const ticket = await client.verifyIdToken({
				// 	idToken: idtoken,
				// 	audience: clientid
				// })
				// const payload = ticket.getPayload()
				// console.log(payload)
				// const userid = payload['sub']
				// // If request specified a G Suite domain:
				// // const domain = payload['hd'];
				// return userid
			} catch (err) {
				return err
			}
		}
	}
}
