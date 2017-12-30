const connection = require('../')
const testPromise = new Promise((resolve, reject) => {
	const testConnection = new connection('bots')
	testConnection.once('ready', _ => {
		testConnection.downloadAll(item => accumulate(item.data.log), res => resolve())

		function accumulate(item){
			item	
			.forEach(x => {
				console.log(x)
			})
		}
	})
})
	.then(x => {
		process.exit()

	})
	.catch(console.error)

