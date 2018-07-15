#!/bin/env node
"use strict";
const readline = require('readline');
const https = require('https');
const fs = require('fs');
const path = require('path');

const Connection = require('../');

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]
const nick = 'score';

const connection = new Connection(room);

let score = {}

connection.once('ready', ev => {
	connection.nick(nick);

	updateState();
	// on a broadcast, reply to the frigging post with one random choice
	connection.on('send-event', ev => {
		//console.log(state, score)
		if(ev.data.content === "!score")
			connection.post( 
				`
Most recent statistics for Football match 

 *** Home
 * team:   ${score.match_hometeam_name}
 * score:  ${score.match_hometeam_score}
 * 

 *** Away
 * team:   ${score.match_awayteam_name}
 * score:  ${score.match_awayteam_score}
 * 
`
				, ev.data.id);
			console.log( 
				new Ascii_table()
					.setBorder('*')
					.setAlignLeft(0)
					.setAlignLeft(1)
					.setHeading(score.match_hometeam_name, score.match_awayteam_name)
					.addRow(score.match_hometeam_score, score.match_awayteam_score)
					.toString()
				);

		if(ev.data.content === `!help @${nick}`)
			connection.post(`Hi!\nI'm ${nick}, I give the score for the football matches currently ongoing and other statistics.\n@K made this.`, ev.data.id);

		if(ev.data.content === `!kill @${nick}`){
			connection.post(`/me is exiting...`, ev.data.id);
			setTimeout(process.exit, 1000);
		}
		if(ev.data.content === `!ping`)
			connection.post(`pong!`, ev.data.id);
		if(ev.data.content === `!ping @${nick}`)
			connection.post(`pong!`, ev.data.id);
	});
});

// setInterval(updateState, 6000)

function updateState() {
	getState().then(res =>  {
		score = res.pop()
		console.log('state refreshed')
	})
}

async function getState() {
	return await new Promise((resolve, reject) => https.get({
		hostname: 'apifootball.com',
		path: '/api/?action=get_events&match_id=297978&APIkey=edbf3048c4db777ee0317d2c23aefecfd991356c41d510628e7b09ea37a65e7f'
	}, (res) => {
		const { statusCode } = res;
		const contentType = res.headers['content-type'];

		let error;
		if (statusCode !== 200) {
			error = new Error('Request Failed.\n' +
				`Status Code: ${statusCode}`);
		} else if (!/^application\/json/.test(contentType)) {
			error = new Error('Invalid content-type.\n' +
				`Expected application/json but received ${contentType}`);
		}
		if (error) {
			console.error(error.message);
			// consume response data to free up memory
			res.resume();
			return;
		}
		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				const parsedData = JSON.parse(rawData);
				resolve(parsedData);
			} catch (e) {
				console.error(e.message);
			}
		});
	}))

}
