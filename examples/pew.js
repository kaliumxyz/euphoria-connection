'use strict';
/* libs */
const Connection = require('../')

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

// instantiate the connection with the room
const connection = new Array()

const settings = [room, 1]

// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
spawn(new Connection(...settings))

function spawn(con) {
	con.once('ready', _=> {
		con.nick('\u0001K')
		connection.push(con)
		spawn(new Connection(...settings))
	})
}
