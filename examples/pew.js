'use strict';
/* libs */
const Connection = require('../');

const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});
/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1];

// instantiate the connection with the room
const connection = new Array();

const settings = [room, 1];

// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
spawn(new Connection(...settings));

let i = 0;

function spawn(con) {
	con.once('ready', _=> {
		con.nick('\u0001K');
		connection.push(con);
		if(i++ < 99)
			spawn(new Connection(...settings));
	});
}

rl.on('line', line => {
	if(line.startsWith('!')){
		connection.forEach(con => con.nick(line));
	}
	connection.forEach(con => con.post(line));
});
