'use strict';
const ws = require('ws');

class connection extends ws {
    constructor(room = 'test', human = 0, uri = 'wss://euphoria.io', options = { origin: 'https://euphoria.io'}, ...callback) {
        options.origin = options.origin ? options.origin : 'https://euphoria.io';
        super(`${uri}/room/${room}/ws?h=${human}`, options);

        this.cookie = '';
        this.once('upgrade', res => {
            this.cookie = res.headers['set-cookie'][0];
        });
        // Setting the basics for the connection
        this.on('open', () => {
            this.on('message', this.handleMsg);
            // Setting default behaviour keep-open behaviour.
            this.on('ping-event', data => {
                // any heartbeat should be riding on this event
                this.send(JSON.stringify({
                    type: 'ping-reply',
                    data: {time: data.data.time}
                }));
            });
        });

        // The snapshot event will happen right after opening and delivers relevant information, as such we can use it for the callback. Should not be a once because it also happens on reconnect.
        this.on('snapshot-event', raw => {
            const data = raw.data;
            this._identity = data.identity;
            this._version = data.version;
            this._session_id = data.session_id;
            this.emit('ready');
            callback.forEach(f => f(raw));
        });
    }

    handleMsg(data) {
        // credit to ArkaneMoose https://github.com/ArkaneMoose/EuphoriaJS/blob/master/connection.js#L19
        // formated as https://github.com/websockets/ws/blob/5d90141505dc41c129ab5d5228e37d49979d7541/lib/event-target.js#L87
        // console.log(data);
        let dt = {};
        try {
            dt = JSON.parse(data);
        } catch (e) {
            this.emit('error', new Error('invalid JSON'));
        }
        if(dt.type)
            this.emit(dt.type, dt);
        else
            this.emit('error', new Error('missing type'));
    }

    who(...callback) {
        this.send(JSON.stringify({
            type: 'who',
        }));
        this.once('who-reply', data => {
            callback.forEach(f => f(data));
        });
    }


    download(number = 100, before = null, ...callback) {
        this.once('log-reply', data => {
            callback.forEach(f => f(data));
            number -= number % 1000;
            if(data.before && number)
                this.download(number-1000, data.before, ...callback);
        });
        this.send(JSON.stringify({
            type: 'log',
            data: {
                n: number % 1000 ? number % 1000 : number,
                before: before ? before : void(0)
            }
        }));
    }


    downloadAll(downloadCallback, ...callback) {
        this.download(100, null, downloadCallback);
        this.on('log-reply', recurse);
        function recurse(data){
            if(data.data.log[0]){
                this.download(1000, data.data.log[0].id, downloadCallback);
            } else {
                () => this.removeListener('log-reply', recurse);
                callback.forEach(f => f(data));
            }
        }
    }

    nick(nick = '<><', ...callback) {
        this.send(JSON.stringify({
            type: 'nick',
            data: {name: nick}
        }));
        this.once('nick-reply', data => {
            callback.forEach(f => f(data));
        });
    }

    pm(user_id, ...callback) {
        this.send(JSON.stringify({
            type: 'pm-initiate',
            data: {user_id: user_id}
        }));
        this.once('pm-initiate-reply', data => {
            callback.forEach(f => f(data));
        });
    }

    grant_manager(user_id, ...callback) {
        this.send(JSON.stringify({
            type: 'grant-manager',
            data: {user_id: user_id}
        }));
        this.once('grant-manager-reply', data => {
            callback.forEach(f => f(data));
        });
    }

    post(text, parent, ...callback) {
        this.send(JSON.stringify({
            type: 'send',
            data: {content: text, parent: parent}
        }));
        this.once('send-reply', data => {
            callback.forEach(f => f(data));
        });
    }

    login(namespace, id, password, ...callback) {
        this.send(JSON.stringify({
            type: 'login',
            data: {namespace: namespace, id: id, password: password}
        }));
        this.once('login-reply', data => {
            callback.forEach(f => f(data));
        });
    }

    registerAccount(namespace, id, password, ...callback) {
        this.send(JSON.stringify({
            type: 'register-account',
            data: {namespace: namespace, id: id, password: password}
        }));
        this.once('register-account-reply', data => {
            callback.forEach(f => f(data));
        });
    }
    ping(time, ...callback) {
        this.connection.send(JSON.stringify({
            type: 'ping',
            data: {time: time}
        }));
        this.once('ping-reply', data => {
            callback.forEach(f => f(data));
        });
    }

}

module.exports = connection;
