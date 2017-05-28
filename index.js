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
				this.send(`{
				"type": "ping",
				"data": {"time": ${data.data.time}}
				}`)
			})
		})

	}

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
	}

	download(number = 100, before = null, ...callback) {
		this.send(`{
			"type": "log",
			"data": {"n": ${number}, "before": "${before}" }
			}`)
		this.once('log-reply', data => {
			callback.forEach(f => f(data))
		})
	}

/*
	downloadAll(downloadCallback, ...callback) {
		this.download(1000)
		this.once('log-reply', data => {
			if (callback) {
				this.ws.on('message', data => {
					let dt = JSON.parse(data)
					if (dt.type === "log-reply")
						// Only do the callback if you actually have stuff to return.
						if (dt.data.log[0]) {
							let parent = dt.data.log[0].id
							dt.data.log.forEach(item => downloadCallback(JSON.stringify(item) + '\n'))
							setTimeout(_ => this.download(1000, parent), 1000)
						} else {

							downloadCallback('end\n')
							this.resetListeners()
							callback.forEach(f => f(data))
						}
				})
			}
		})
	}
*/

	nick(nick = '<><', ...callback) {
		this.send(`{
		"type": "nick",
		"data": {"name": "${nick}"}
		}`)
		this.once('nick-reply', data => {
			callback.forEach(f => f(data))
		})
	}

	post(text, parent, ...callback){
		this.send(`{
		"type": "send",
		"data": {"content": "${text}", "parent": ${parent}}
		}`)
		this.once('send-reply', data => {
			callback.forEach(f => f(data))
		})
	}
}

module.exports = connection