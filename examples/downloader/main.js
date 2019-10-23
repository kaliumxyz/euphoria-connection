#!/usr/bin/env node
"use strict";
const Connection = require("../../")
const sqlite     = require("sqlite3")


/* config */
const room    = process.argv[2] || "test"
const db_file = process.argv[3] || `${room}.sqlite`

const db  = new sqlite.Database(db_file)
const bot = new Connection(room)

/* globals */
const _global = {
    post_counter:   0,
    user_counter:   0,
    start:          0,
    updated_flag:   false,
    updated_offset: 0,
    timestamp:      null
}

const repo = "private"

// this increases the chance of corruption but massively increases the speed
db.exec("PRAGMA synchronous=OFF")

db.all("SELECT name FROM sqlite_master WHERE type='table'", main)

// set to true for logging the packages as they are written to DB
const debug = false ?
      console.log:
      () => {}

const error = (...err) => {
    console.error(...err)
    console.error(`please report this at ${repo}`)
}

async function seed () {
    console.log("seeding DB")
    await new Promise((resolve, reject) => {
        db.run(`
        CREATE TABLE log (
            id      TEXT,
            parent  TEXT,
            time    NUMERIC,
            sender  TEXT,
            content TEXT,
            edited  BOOLEAN,
            deleted BOOLEAN
        )
        `, resolve)
    })
    await new Promise((resolve, reject) => {
        db.run(`
        CREATE TABLE sender (
            id         TEXT,
            name       TEXT,
            server_id  TEXT,
            server_era TEXT,
            session_id TEXT,
            is_manager TEXT
        )
        `, resolve)
    })
    console.log("seeding DB: done!")
}

function expect (err, result) {
    if (err !== null) {
        throw err
    }
    return result
}

function curry_except (fn) {
    return (err, result) => {
        if (err !== null) {
            throw err
        }
        return fn(result)
    }
}

function parse_sqlite_promise (resolve) {
    return (err, result) => {
        if (err !== null) {
            throw err
        }
        if (Object.values(result).length) {
            return resolve(Object.values(result))
        } else {
            return resolve(null)
        }
    }
}

async function main (err, result) {
    let offset = 0
    let done   = 0

    if (err) {
        throw err
    }

    if (result.filter(x => x.name === "log" || x.name === "sender").length !== 2) {
        await seed()
    } else {
        debug(`updating!`)
        // we can update, so lets set the timestamp to the last posts
        _global.timestamp = await new Promise((resolve) => db.get("SELECT MAX(time) FROM log", parse_sqlite_promise(resolve)))
        _global.timestamp = _global.timestamp.pop()
        debug(`updating till before ${_global.timestamp}`)

        _global.start = (await new Promise((resolve) => {
            db.get("SELECT COUNT(*) FROM log", parse_sqlite_promise(resolve))
        }).catch(error))
    }

    const post      = db.prepare("INSERT INTO log VALUES (?, ?, ?, ?, ?, ?, ?)")
    const user      = db.prepare("INSERT INTO sender VALUES (?, ?, ?, ?, ?, ?)")
    const get_user  = db.prepare("SELECT * FROM sender WHERE ID = (?) AND NAME = (?) AND SESSION_ID = (?)")

    async function store (log) {
        if (log.length === 0) {
            error("store called with empty array!")
            return
        }
        offset += log.length
        _global.post_counter += log.length
        const total     = log.length * 3 // 3 statements to be ran
        let   processed = 0
        const timestamp = log[0].time
        console.log("receiving: ", log.length, "received: ", offset)
        console.log("latest timestamp: ", timestamp)

        while(log.length) {
            const message = log.pop()
            const { id, parent, time, sender, content, edited, deleted } = message
            debug(message)
            debug(_global.post_counter,log.length)
            if (time === _global.timestamp) {
                debug(`done updating, ${time} === ${_global.timestamp}`)
                _global.updated_offset = log.length + 1
                _global.updated_flag   = true
                return
            } else if (time < _global.timestamp) {
                error(`quit updating, ${time} < ${_global.timestamp}`)
                _global.updated_offset = log.length + 1
                _global.updated_flag   = true
                return
            }
            post.run([id, parent, time, sender.id, content, edited, deleted], (err) => {
                if (err) throw err
                processed += 1
                done      += 1
            })
            get_user.get(sender.id, sender.name, sender.session_id, (err, result) => {
                if (err) throw err
                if (result === void 0) {
                    processed += 1
                    done      += 1
                    const { id, name, server_id, server_era, session_id, is_manager } = sender
                    user.run([id, name, server_id, server_era, session_id, is_manager], (err) => {
                        if (err)
                            throw err
                        processed += 1
                        done      += 1
                    })
                } else {
                    processed += 2
                    done      += 2
                }
            })
        }

        function check(callback) {
            debug(`processed: ${processed}/${total}`)
            if (total === processed) {
                callback()
            }
        }

        await new Promise((resolve, reject) => {
            setInterval(_ => check(resolve), 200)
        })

        console.log("done storing batch: ", timestamp)
        debug("current items stored: ", offset)
        // return await finish(_offset)
    }

    await download_all(store)

    function report() {
        console.log(`queries processed: ${done}/${offset * 3}`)
    }

    setInterval(_ => report(), 1000)
}

function download_promise(n = 100, id = null) {
    return new Promise((resolve, reject) => {
        bot.download(n, id, resolve);
    })
}

async function download_all(callback) {

    await new Promise((resolve, reject) => {
        bot.once("ready", resolve)
    })

    download()

    let count = 0

    async function download(last = false, counter = 0) {
        let result = false

        if (last) {
            result = await download_promise(1000, last)
        } else {
            result = await download_promise()
        }

        // if there is no result, this will throw
        if(!_global.updated_flag && result.data.log[0]) {
            // no cap on memory consumption
            download(result.data.log[0].id, counter + 1)
            await callback(result.data.log)
            debug(`done with: ${counter}`)
            count += 1
        } else {
            console.log("done downloading!")
            await wait_for_n_callbacks_to_be_done(counter)
            console.log("done processing!")
            await finish(_global.post_counter - _global.updated_offset)
            process.exit(0)
        }
    }

    async function wait_for_n_callbacks_to_be_done(n) {
        console.log("waiting for processing to be done")

        function check(callback) {
            console.log(`processed batches: ${count}/${n}`)
            if (count === n)
                callback()
        }

        await new Promise((resolve, reject) => {
            setInterval(_ => check(resolve), 1000)
        })

        return null
    }

}

async function finish (total) {
    let start = _global.start
    console.log(`sanity check, did we really store ${total} messages?`)

    if (total === 0 && start > 0) {
        console.log(`we didn't store anything new. total is at: ${total} + ${start} = ${total - -start}`)
        return
    } else if (total === 0) {
        error(`we didn't store anything, is the room empty?`)
        return
    }

    if (start > 0) {
        console.log(`new total: ${total} + ${start} = ${total - -start}`)
    }

    const posts = (await new Promise((resolve) => {
        db.get("SELECT COUNT(*) FROM log", parse_sqlite_promise(resolve))
    }).catch(error))

    if (posts - start === total)
        console.log(`we got ${posts - start} / ${total}, we did it!`)
    else {
        error(`we only got ${posts} / ${total - -start}, something is wrong!`)
    }
}
 
