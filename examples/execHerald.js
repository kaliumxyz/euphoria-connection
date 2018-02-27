'use strict';
/* libs */
const Connection = require('../')
const child = require('child_process');

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

// instantiate the connection with the room
const connection = new Connection(room)
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
connection.once('ready', _ => {
	// on any join event greet the person joining
	connection.nick('><>')
	connection.on('join-event', ev => {
		if(ev.data.name === "K")
			child.exec(`node ./magic.js -r ${room}`)
	})
})
