'use strict';
/* native denendencies */
const fs = require('fs')
const path = require('path')
const readline = require('readline')

/* dependencies */
const Connection = require('euphoria-connection')
const color = require('euphoria-color')
const chalk = require('chalk')

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

/* globals */
let userList = []

// instantiate the connection with the room
let connection

/**
 * Update the userList global with new data from the targeted euphoria room. We use the snapshot even send on a new connect to update the userlist.
 */
function update() {
	connection = new Connection(room)
	// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
	connection.on('ready', _ => {
		connection.on('snapshot-event', event => {
			// get every listener including bots and lurkers
			userList = event.data.listing.sort()
			render(userList)
			connection.close()
		})
	})
}

// init the program by calling our update function
update()

// set our program to run the update function once every 10 seconds
setInterval(update, 1000 * 10)

/**
 * Render our list, replace the old console content with our newer content and place the relevant data in the relevant places.
 * @param {Array} list 
 */
function render(list) {
	const blank = new Array(process.stdout.rows).fill('\n')
	console.log(blank)
	readline.cursorTo(process.stdout, 0, 0)
	readline.clearScreenDown(process.stdout)
	list.forEach( user => {
		console.log(`${chalk.hsl(color(user.name),100,50)(user.name)}: ${user.id}`)
	})


}