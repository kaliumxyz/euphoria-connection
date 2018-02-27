'use strict';
/* libs */
const Connection = require('../')

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

let nick = (process.argv.join().match(/-n,(\w+)/) || [,'pewpewpew'])[1]

let loop = (process.argv.join().match(/-l,(\w+)/) || [,false])[1]

// instantiate the connection with the room
const connection = new Array()

const settings = [room, 1]

nick = nick.split('')

let inc = "\u0001"
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
spawn(nick, new Connection(...settings))

function spawn(nick, con) {
	con.once('ready', _=> {
		if(!loop){
			con.nick(inc + nick.pop())
			inc += "\u0001"
		}
		else {
			nick.unshift(nick.pop())

			con.nick(inc + nick[0])

			if(inc.length >= nick.length)
				inc = ""
			inc += "\u0001"
		}

		connection.push(con)
		if(nick[0])
		spawn(nick, new Connection(...settings))
		setTimeout(_ => con.close(), 2000)//600 * nick.length)
	})
}
