import test from 'ava'
const connection = require('./')

test('can create connection',t => {
	t.true(new connection('test') instanceof connection)
})

test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', _ => resolve())
	})

	t.is(await testPromise)
})

test('can set nick', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', _ => {
			testConnection.nick('><>', _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can download', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', _ => {
			testConnection.download(1000, null, _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can post', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', _ => {
			testConnection.post("pew", null, _ => resolve())
		})
	})

	t.is(await testPromise)
})
// test('downloadAll', async t => {
// 	const testPromise = new Promise((resolve, reject) => {
// 		const testConnection = new connection('test', 0, false, callback)
// 		function callback () {
// 			testConnection.downloadAll( _ => _ , resolve)
// 		}
// 	})

// 	t.is(await testPromise)
// })