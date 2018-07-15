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

const similiar = {'a':'α', 'A': 'Α', 'B':'Β', 'K':'Κ','k': 'κ'};
const connection = new Connection(room, 1);

connection.once('ready', ev => {
	connection.nick('blue');

	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', ev => {
		log(ev);
		if(options[ev.data.content])
			connection.nick(options[ev.data.content]);

	});
});

function replicate_color(donor, clone) {
	const donor_hash = hue_hash(donor);
	const names = get_possible_names(clone).map(hue_hash);

}

function get_possible_names(text) {
	return text.split('').map(char => similiar[char] || char);
}

function hue_hash(text, offset = 0) {
	// DJBX33A-ish.
	let val = 0;
	for (let i = 0; i < text.length; i++) {
		// scramble char codes across [0-255]
		// prime multiple chosen so @greenie can green, and @redtaboo red.
		const charVal = (text.charCodeAt(i) * 439) % 256;

		// multiply val by 33 while constraining within signed 32 bit int range.
		// this keeps the value within Number.MAX_SAFE_INTEGER without throwing out
		// information.
		const origVal = val;
		val = val << 5;
		val += origVal;

		// add the character information to the hash.
		val += charVal;
	}

	// cast the result of the final character addition to a 32 bit int.
	val = val << 0; 

	// add the minimum possible value, to ensure that val is positive (without
	// throwing out information).
	val += 2147483648;

	// add the calibration offset and scale within 0-254 (an arbitrary range kept
	// for consistency with prior behavior).
	return (val + offset) % 255;
}

module.exports = {hue_hash, get_possible_names, replicate_color};
