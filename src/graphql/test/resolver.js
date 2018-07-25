import { OAuth2Client } from 'google-auth-library'

exports.resolver = {
	Query: {
		async Test (db, {idtoken, clientid, clientsecret, redirecturi}) {
			try {
				const client = new OAuth2Client(clientid, clientsecret, redirecturi)
				let ticket = await client.verifyIdToken({
					idToken: idtoken,
					audience: clientid
				})
				const payload = ticket.getPayload()
				const userid = payload['sub']
				return userid
			} catch (err) {
				return err
			}
		}
	}
}
