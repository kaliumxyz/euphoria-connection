const connection = require('./')
const testPromise = new Promise((resolve, reject) => {
	const testConnection = new connection('xkcd')
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

