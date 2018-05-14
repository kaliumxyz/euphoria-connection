#!/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const Connection = require('../');

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, 'choose.log'), { flags: 'a' });
function log(...text) {
	text.forEach(text => {
		logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`);
	});
}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1];

const options = ['yes', 'no', 'because you deserve it','unscrew that banana', 'p > 0.05', 'ask again later', 'perhaps'];
let flag = 0

const connection = new Connection(room, 1);

connection.once('ready', ev => {
	connection.nick('K');

	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', ev => {
		log(ev);
		if(ev.data.content.startsWith('.choose')){
			const options = ev.data.content
				.substring(7)
				.split(',');
			log(options);
			connection.post(options[Math.floor(Math.random() * options.length)], ev.data.id);
		}
		if(ev.data.content.startsWith('godhead')){
			log(options);
			if(flag)
				connection.post('@xyzzy? yea ofc he is');
			else
				connection.post(options[Math.floor(Math.random() * options.length)], ev.data.id);
		}
	});
});
