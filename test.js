import test from 'ava';
import { setInterval } from 'timers';
const connection = require('./');

const config = {
	room: 'test'
};

test('can create connection',t => {
	t.true(new connection(config.room) instanceof connection);
});

test('can connect', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => resolve());
	});

	t.is(await testPromise);
});

test('can reconnect', async t => {
	const testPromise = new Promise(resolve => {
		let testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection = new connection(config.room);
			testConnection.once('ready', () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can set nick', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.nick('><>', () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can download', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.download(1000, null, () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can download multiple requests', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.download(2000, null, () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can download all', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.downloadAll( _ => _, () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can post', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.nick('can post');
			testConnection.post('post', null, () => resolve());
		});
	});

	t.is(await testPromise);
});

test('can post with parent', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.nick('can post with parent');
			testConnection.post('parent post', null, json => {
				testConnection.post('child post', json.data.id, () => resolve());
			});
		});
	});

	t.is(await testPromise);
});

test('can lurk for 2 minutes', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			testConnection.nick();
			setTimeout( () => {
				resolve();
			}, 1000 * 60 * 2);
		});
	});

	t.is(await testPromise);
});

test('can lurk for 2 minutes while changing nick every second', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			let i = 120;
			testConnection.nick('120');
			setInterval( () => {
				testConnection.nick('' + --i);
			}, 1000);
			setTimeout( () => {
				resolve();
			}, 1000 * 60 * 2);
		});
	});

	t.is(await testPromise);
});

test('can get a userID', async t => {
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			resolve(testConnection._identity);
		});
	});

	t.is(typeof await testPromise, 'string');
});

test('can request to register an account', async t => {
	const credentials = require('./creds.json');
	const testPromise = new Promise(resolve => {
		const testConnection = new connection('pmtest');
		testConnection.once('ready', () => {
        testConnection.nick('narwal', () => {
			      testConnection.registerAccount('',  credentials.name, credentials.password);
			      testConnection.once('register-account-reply', () => {
				        resolve();
			      });
        });
		});
	});

	t.is(await testPromise);
});

test.skip('can register an account', async t => {
	  const credentials = require('./creds.json');
	  const testPromise = new Promise(resolve => {
		    const testConnection = new connection('pmtest');
		    testConnection.once('ready', () => {
            testConnection.nick('narwal', () => {
                testConnection.post('test', () => {
                    testConnection.registerAccount('email',  credentials.name, credentials.password, reply => {
                        console.log(reply);
                        resolve();
                    });
                });
            });
		    });
	  });

	  t.is(await testPromise);
});

test('can login to an account', async t => {
    const credentials = require('./creds.json');
	const testPromise = new Promise(resolve => {
		const testConnection = new connection(config.room);
		testConnection.once('ready', () => {
			  testConnection.login('email',  credentials.email, credentials.password, reply => {
				    resolve();
        });
		});
	});

	t.is(await testPromise);
});

test('can login to an account and switch IDs', async t => {
    const credentials = require('./creds.json');
    const testPromise = new Promise(resolve => {
        const testConnection = new connection('pmtest');
        testConnection.once('ready', () => {
            testConnection.login('email',  credentials.email, credentials.password, reply => {
                const newConnection = new connection('pmtest', 0, 'wss://euphoria.io', {headers: {Cookie: testConnection.cookie}});
                newConnection.once('ready', () => {
                    newConnection.nick('narwal');
                    setTimeout(resolve,1000);
                });
            });
        });
    });

    t.is(await testPromise);
});

test.only('can initiate a PM', async t => {
    const credentials = require('./creds.json');
    const testPromise = new Promise(resolve => {
        const testConnection = new connection('pmtest');
        testConnection.once('ready', () => {
            testConnection.login('email',  credentials.email, credentials.password, reply => {
                const newConnection = new connection('pmtest', 0, 'wss://euphoria.io', {headers: {Cookie: testConnection.cookie}});
                newConnection.once('ready', () => {
                    console.log(newConnection._identity)
                    newConnection.pm(newConnection._identity, console.log);
                    setTimeout(resolve,1000);
                });
            });
        });
    });
	  t.is(await testPromise);
});
