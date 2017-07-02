'use strict'
const ws = require('ws')

class connection extends ws {
	constructor(room = 'test', human = 0, uri = "wss://euphoria.io", options = { origin: 'https://euphoria.io' }, ...callback) {
		super(`${uri}/room/${room}/ws?h=${human}`, options)

		// Setting the basics for the connection
		this.on('open', data => {
			callback.forEach(f => f(data))
			this.emit('ready')

			this.on('message', this.handleMsg)
			// Setting default behaviour keep-open behaviour.
			this.on('ping-event', data => {
				this.send(JSON.stringify({
				type: "ping",
				data: {time: data.data.time}
				}))
			})
		})

	}

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
	}

	download(number = 100, before = null, ...callback) {
		this.send(JSON.stringify({
			type: "log",
			data: {
				n: number,
				before: before ? before : void(0)
			}
		}))
		this.once('log-reply', data => {
			callback.forEach(f => f(data))
		})
	}


	downloadAll(downloadCallback, ...callback) {
		this.download(100, null, downloadCallback)
		this.on('log-reply', recurse)
		function recurse(data){
			if(data.data.log[0]){
				console.log("recurse")
				this.download(1000, data.data.log[0].id, downloadCallback)
			} else {
				console.log('done')
				_ => this.removeListener('log-reply', recurse)
				callback.forEach(f => f(data))
			}
		}
	}

	nick(nick = '<><', ...callback) {
		this.send(JSON.stringify({
		type: "nick",
		data: {name: nick}
		}))
		this.once('nick-reply', data => {
			callback.forEach(f => f(data))
		})
	}

	post(text, parent, ...callback) {
		this.send(JSON.stringify({
		type: "send",
		data: {content: text, parent: parent}
		}))
		this.once('send-reply', data => {
			callback.forEach(f => f(data))
		})
	}
}

module.exports = connection