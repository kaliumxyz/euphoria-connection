'use strict'
const WebSocket = require('ws')
const EventEmitter = require('events')
let logger = require('k-log')
logger = new logger('euphoria.log', true, false)

class connection extends EventEmitter {
	constructor(room = 'test', human = 0, ...callback) {
		super()
		const ws = new WebSocket(`wss://euphoria.io/room/${room}/ws?h=${human}`, {
			origin: 'https://euphoria.io'
		})

		this.ws = ws
		this.resetListeners()
		this.ws.on('open', data => {
			this.log('opened: ', data)
			this.call(...callback)
		})

	}


	resetListeners() {
		let that = this
		this.ws.removeAllListeners()

		this.ws.on('close', (data, pew) => {
			this.log('closed: ', data, pew)
		})

		this.ws.on('error', err => {
			this.log(err)
		})

		this.ws.on('message', data => {
			this.log(data)
			let dt = JSON.parse(data)
			if (dt.type === "ping-event") {
				that.send("ping-reply", { "time": dt.data.time })
			}
		})
	}
	send(type, data) {
		this.log(data)

		if (data)
			data = ', "data":' + JSON.stringify(data)
		else
			data = ''
		this.ws.send(`{
		"type": "${type}"
		${data}
		}`)
	}

	download(number = 100, before, ...callback) {
		if (before)
			this.send("log", { n: number, "before": before })
		else
			this.send("log", { n: number })
		this.call(...callback)
	}

	downloadAll(downloadCallback, ...callback) {
		this.download(1000)
		this.ws.on('message', data => {
		if (callback) {
			this.ws.on('message', data => {
				let dt = JSON.parse(data)
				if (dt.type === "log-reply")
					// Only do the callback if you actually have stuff to return.
					if (dt.data.log[0]){
						let parent = dt.data.log[0].id
						dt.data.log.forEach(item => downloadCallback(JSON.stringify(item) + '\n'))
						setTimeout(_ => this.download(1000, parent), 1000)
					} else {
						
						downloadCallback('end\n')
						this.resetListeners()
						this.call(...callback)
					}
			})
		}
		})
	}

	nick(nick = '<><') {
		this.send('nick', { "name": nick })
		return nick
	}

	log(data) {
		logger.log(data)
	}

	call(...callback) {
		if (callback)
			try {
				callback.forEach(e => e())
			} catch (e) {
				console.error(`Your callback function(s) threw the following error: `, e)
			}
	}
}

module.exports = connection