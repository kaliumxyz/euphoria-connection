import test from 'ava'
import { setInterval } from 'timers';
const connection = require('./')

const config = {
	room: 'test'
}

test('can create connection',t => {
	t.true(new connection(config.room) instanceof connection)
})

test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => resolve())
	})

	t.is(await testPromise)
})

test('can reconnect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		let testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection = new connection(config.room)
			testConnection.once('ready', _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can set nick', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.nick('><>', _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can download', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.download(1000, null, _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can download multiple requests', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.download(2000, null, _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can download all', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.downloadAll( _ => _, _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can post', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.nick('><>')
			testConnection.post('pew', null, _ => resolve())
		})
	})

	t.is(await testPromise)
})

test('can lurk for 2 minutes', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.nick()
			setTimeout( _ => {
				resolve()
			}, 1000 * 60 * 2)
		})
	})

	t.is(await testPromise)
})

test('can lurk for 2 minutes while changing nick every second', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			let i = 120
			testConnection.nick('120')
			setInterval( _ => {
				testConnection.nick('' + --i)
			}, 1000)
			setTimeout( _ => {
				resolve()
			}, 1000 * 60 * 2)
		})
	})

	t.is(await testPromise)
})

test('can get a userID', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			resolve(testConnection.identity)
		})
	})

	t.is(typeof await testPromise, 'string')
})

test('can initiate a PM', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.once('pm-initiate-event', _ => resolve())
			testConnection.pm(testConnection.identity)
		})
	})

	t.is(await testPromise)
})

test.skip('can register an account', async t => {
	const credentials = require('./creds.json')
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.registerAccount(testConnection.session_id, testConnection.identity, 'narwall')
			testConnection.once('register-account-reply', _ => {
				resolve()
			})
		})
	})

	t.is(await testPromise)
})

test.skip('can login to an account', async t => {
	const credentials = require('./creds.json')
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection(config.room)
		testConnection.once('ready', _ => {
			testConnection.login(testConnection.session_id, testConnection.identity, 'narwall')
			testConnection.once('register-account-reply', _ => {
				resolve()
			})
		})
	})

	t.is(await testPromise)
})
