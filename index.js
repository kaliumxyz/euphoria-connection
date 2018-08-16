'use strict'
const ws = require('ws')

class connection extends ws {
	constructor(room = 'test', human = 0, uri = 'wss://euphoria.io', options = { origin: 'https://euphoria.io' }, ...callback) {
		super(`${uri}/room/${room}/ws?h=${human}`, options)

		// Setting the basics for the connection
		this.on('open', data => {
			this.on('message', this.handleMsg)
			// Setting default behaviour keep-open behaviour.
			this.on('ping-event', data => {
				this.send(JSON.stringify({
				type: 'ping-reply',
				data: {time: data.data.time}
				}))
			})
		})


		// The snapshot event will happen right after opening and delivers relevant information, as such we can use it for the callback.
		this.on('snapshot-event', raw => {
			const data = raw.data
			this.identity = data.identity
			this.version = data.version
			this.session_id = data.session_id
			this.emit('ready')
			callback.forEach(f => f(raw))
		})

	}

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
	}

	who(...callback) {
		this.send(JSON.stringify({
			type: 'who',
		}))
		this.once('who-reply', data => {
			callback.forEach(f => f(data))
		})
	}


	download(number = 100, before = null, ...callback) {
			this.once('log-reply', data => {
				callback.forEach(f => f(data))
				number -= number % 1000  
				if(data.before && number)
					download(number-1000, data.before, ...callback)
			})
			this.send(JSON.stringify({
				type: 'log',
				data: {
					n: number % 1000 ? number % 1000 : number,
					before: before ? before : void(0)
				}
			}))
		}


	downloadAll(downloadCallback, ...callback) {
		this.download(100, null, downloadCallback)
		this.on('log-reply', recurse)
		function recurse(data){
			if(data.data.log[0]){
				this.download(1000, data.data.log[0].id, downloadCallback)
			} else {
				_ => this.removeListener('log-reply', recurse)
				callback.forEach(f => f(data))
			}
		}
	}

	nick(nick = '<><', ...callback) {
		this.send(JSON.stringify({
		type: 'nick',
		data: {name: nick}
		}))
		this.once('nick-reply', data => {
			callback.forEach(f => f(data))
		})
	}

	pm(user_id, ...callback) {
		this.send(JSON.stringify({
		type: 'pm-initiate',
		data: {user_id: user_id}
		}))
		this.once('nick-reply', data => {
			callback.forEach(f => f(data))
		})
	}

	post(text, parent, ...callback) {
		this.send(JSON.stringify({
		type: 'send',
		data: {content: text, parent: parent}
		}))
		this.once('send-reply', data => {
			callback.forEach(f => f(data))
		})
	}

	login(namespace, id, password) {
		this.send(JSON.stringify({
		type: 'login',
		data: {namespace: namespace, id: id, password: password}
		}))
		this.once('login-reply', data => {
			callback.forEach(f => f(data))
		})
	
	}

	registerAccount(namespace, id, password) {
		this.send(JSON.stringify({
		type: 'send',
		data: {content: text, parent: parent}
		}))
		this.once('send-reply', data => {
			callback.forEach(f => f(data))
		})
	
	}
}

module.exports = connection
