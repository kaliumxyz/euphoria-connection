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

let score = []

let state = {score: []};

connection.once('ready', ev => {
	connection.nick('score');

	getState()
	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', ev => {
		console.log(state, score)
		writeState()
		let match = ev.data.content.match(/(:?(:?@\w+ [0-9]+ point(:?|:?s)?)|:?(:?point(:?|:?s)) [0-9]+ @\w+)/)
		if(ev.data.content === "!score")
			connection.post(`you have ${score[ev.data.sender.name]?score[ev.data.sender.name]:0} points`, ev.data.parent)
		if(score)
		if(ev.data.sender.name.match(/[K\u0001]/))
		if(match){
			let recipiant = match[0].match(/@(\w+)/)[1]
			let points = match[0].match(/[0-9]+/)[0]
			console.log(score)
			score[recipiant] =  score[recipiant] ? score[recipiant] + points : points
			connection.post(`giving ${points} points to ${recipiant}`, ev.data.parent)
			console.log(match[0])
				//connection.post(options[Math.floor(Math.random() * options.length)], ev.data.id);
			}
	});
});


function getState() {
	fs.readFile('state.json', 'utf8', (err, data) => {
		if(err){
			state = {score: []}
			score = []
			writeState()
		} else {
			state = data	
			score = state.score
		}
	})
}

function writeState() {
	state.score = score
	fs.writeFile('state.json', JSON.stringify(state), console.log)
}
