#!/bin/env node
'use strict';
const Connection = require('../');
const https = require('https');

/* config */
const option_definitions = [
	{ name: 'room', alias: 'r', type: Number }
];

const options = require('command-line-args')(option_definitions);
const room = options.room || 'test';

const connection = new Connection(room);

let qeueue = getQueue();

connection.once('ready', () => {
	connection.nick('Quanta');

	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', async ev => {
		if(ev.data.content.startsWith('!qroll'))
			if(ev.data.sender.name.match(/[K\u0001]/)){
				const number = ev.data.content.match(/[0-9]+/)[0];
				connection.post(`${queue.pop()}`, ev.data.parent);
			}
	});
});

async function getQueue(queue) {
	queue = await new Promise((resolve, reject) => 
		https.get({host: 'https://qrng.anu.edu.au/API/jsonI.php?length=1000&type=uint8'},
			res => {
				let file = '';
				res.on('data', data => file += data);
				res.once('end', () => res(file));
			}
		).once('error', reject));

	return queue;
}
