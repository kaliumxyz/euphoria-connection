'use strict';
/* libs */
const Connection = require('euphoria-connection')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, `monitor.log`), { flags: 'a' });
function log(...text) {
		console.log(text)
		text.forEach(text => {
			logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`)
		})
	}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

// instantiate the connection with the room
const connection = new Connection(room)
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
connection.once('ready', _ => {
	// on any message send log to console
	connection.on('send-event', ev => console.log(chalk.blue(`${ev.data.sender.name}: ${ev.data.content}`)))
	// join event (someone joining)
	connection.on('join-event', ev => console.log(chalk.green(`${ev.data.name || 'someone'} joined`)))
	// part event (someone leaving)
	connection.on('part-event', ev => console.log(chalk.red(`${ev.data.name || 'someone'} left`)))
})
