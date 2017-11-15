'use strict';
/* libs */
const Connection = require('../')

/* config */
const room = "test"

// instantiate the connection with the room
const connection = new Connection(room)
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
connection.once('ready', _ => {
	// on any join event greet the person joining
	connection.nick('><>')
	connection.on('join-event', ev => {
		connection.post(`greetings @${ev.data.name || "new user"}`)
	})
})