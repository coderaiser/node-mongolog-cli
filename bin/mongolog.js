#!/usr/bin/env node

'use strict';

const http = require('http');

const argv = process.argv;
const args = require('minimist')(argv.slice(2), {
    string: [
        'ip',
        'url',
        'date'
    ],
    boolean: [
        'server'
    ],
    default: {
        server : false,
    },
    alias: {
        v: 'version',
        h: 'help'
    }
});

if (args.version)
    version();
else if (args.help)
    help();
else if (!args.url)
    console.error('url should be defined');
else
    connect();

function connect() {
    const MongoClient = require('mongodb').MongoClient;
    const url =  'mongodb://' + args.url;
    
    const rendy = require('rendy/legacy');
    
    MongoClient.connect(url, function(e, db) {
        if (!error(e))
            if (!args.server)
                show(db, 'mongolog');
            else
                server(db);
    });
}

function show(db, name) {
    const ip = args.ip;
    const date = args.date;
    const collection = db.collection(name);
    
    const shortdate = require('shortdate');
    const chalk = require('chalk');
    
    if (date)
        return showByDate(date, collection, (docs) => {
            showResults(date, docs);
        });
    
    if (ip)
        return find(collection, {ip}, (docs) => {
            showResults(docs);
        });
    
    find(collection, {}, (docs) => {
        showResults(docs);
    });
}

function find(collection, data, callback) {
    collection.find(data).toArray((e, docs) => {
        if (!error(e))
            callback(docs);
    });
}

function showByDate(date, collection, fn) {
    find(collection, {date: date}, fn);
}

function showResults(date, docs) {
    const urlCount = '{{ url }}: {{ count }}';
    
    if (!docs) {
        docs = date;
        date = null;
    }
    
    if (!docs.length) {
        log('red', 'no queries found. so sad :(');
        return process.exit();
    }
    
    if (date)
        log('green', date);
    
    docs.forEach((doc) => {
        if (!date)
            log('green', doc.date);
        
        log('yellow', doc.ip);
            
        doc.urls.forEach((current) => {
            const url = current.url;
            const count = chalk.green(current.count);
            
            log(rendy(urlCount, {
                url,
                count,
            }));
        });
    });
    
    process.exit();
}

function server(db) {
    const express = require('express');
    const mongoLog = require('mongolog');
    const app = express();
    const port = 1337;
    const ip = '0.0.0.0';
    
    app.use(mongoLog({
        db
    }));
    
    app.use(express.static(process.cwd()));
    
    http.createServer(app)
        .listen(port, ip);
    
    console.log('url: %s:%s', ip, port);
}

function version() {
    cosnt info = require('../package');
    console.log(info.version);
}

function help() {
    const bin = require('../json/bin');
    const usage = 'Usage: cloudcmd [options]';
    
    console.log(usage);
    console.log('Options:');
    
    Object.keys(bin).forEach((name) => {
        console.log('  %s %s', name, bin[name]);
    });
}

function log(color, msg) {
    if (!msg)
        return console.log(color);
    
    const tmpl = chalk[color]('%s');
    console.log(tmpl, msg);
}

function error(e) {
    if (e) {
        console.error(e.message);
        process.exit();
    }
    
    return !!e;
}

