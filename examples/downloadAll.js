#!/bin/env node
"use strict";
const connection = require('../')

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

const testPromise = new Promise((resolve, reject) => {
	const testConnection = new connection(room)
	testConnection.once('ready', _ => {
		let acc = []
		testConnection.downloadAll(item => accumulate(acc, item.data.log), res => resolve(acc))

		function accumulate(acc, item){
			acc.push(item)
		}
	})
})
	.then(x => {
		x
		.forEach(x => {
			x
			.forEach(x => {
				console.log(x)
			})
		})
		process.exit()

	})
	.catch(console.error)

