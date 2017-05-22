# euphoria-connection [![Build Status](https://travis-ci.org/kaliumxyz/euphoria-connection.svg?branch=master)](https://travis-ci.org/kaliumxyz/euphoria-connection)
> make connections to [euphoria.io](https://euphoria.io/) :D.

## install
simply download it from npm.
```
$ yarn add euphoria-connection
```


## usage
Require it and you can proceed to create new connections :D.
```js
const euphoriaConnection = require('euphoria-connection')
const connection = new euphoriaConnection()
```

connections will default to the &test room. Once you've created a connection you can send data over it with the send() method.

## tests
```
$ yarn test
```

## license
MIT © [Kalium](https://kalium.xyz)
