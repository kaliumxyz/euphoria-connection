#!/bin/env node
"use strict";
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const Connection = require('../');

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, `choose.log`), { flags: 'a' });
function log(...text) {
		text.forEach(text => {
			logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`)
		})
	}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

const connection = new Connection(room);

connection.once('ready', ev => {
	connection.nick('choice');

	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', ev => {
		log(ev)
		if(ev.data.content.startsWith('.choose')){
				const options = ev.data.content
					.substring(7)
					.split(',');
				log(options);
				connection.post(options[Math.floor(Math.random() * options.length)], ev.data.id);
			}
	});
});
