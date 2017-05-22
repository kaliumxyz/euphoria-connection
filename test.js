import test from 'ava'
const connection = require('./')

test('can create connection',t => {
	t.true(new connection('test') instanceof connection)
})
test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test', 0, false, resolve)
	})

	t.is(await testPromise)
})

test('download', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test', 0, false, callback)
		function callback () {
			testConnection.download(100, false, _ => resolve())
		}
	})

	t.is(await testPromise)
})

test('downloadAll', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test', 0, false, callback)
		function callback () {
			testConnection.downloadAll( _ => _ , resolve)
		}
	})

	t.is(await testPromise)
})