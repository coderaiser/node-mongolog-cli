(function() {
    'use strict';
    
    var http        = require('http'),
        
        chalk,
        rendy,
        shortdate,
        
        argv        = process.argv,
        args        = require('minimist')(argv.slice(2), {
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
        var MongoClient = require('mongodb').MongoClient,
            url         =  'mongodb://' + args.url;
        
        rendy       = require('rendy');
        
        MongoClient.connect(url, function(error, db) {
            if (error)
                console.error(error.message);
            else if (!args.server)
                show(db, 'mongolog');
            else
                server(db);
        });
    }
    
    function show(db, name) {
        var ip          = args.ip,
            date        = args.date,
            collection  = db.collection(name);
        
        shortdate       = require('shortdate'),
        chalk           = require('chalk');
        
        if (date)
            showByDate(date, collection, function(docs) {
                showResults(date, docs);
            });
        else if (ip)
            find(collection, {ip: ip}, function(docs) {
                showResults(docs);
            });
        else
            find(collection, {}, function(docs) {
                showResults(docs);
            });
    }
    
    function find(collection, data, callback) {
        collection.find(data).toArray(function(error, docs) {
            if (error)
                console.error(error.message);
            else
                callback(docs);
        });
    }
    
    function showByDate(date, collection, fn) {
        find(collection, {date: date}, fn);
    }
    
    function showResults(date, docs) {
        var urlCount = '{{ url }}: {{ count }}';
        
        if (!docs) {
            docs = date;
            date = null;
        }
        
        if (!docs.length) {
            log('red', 'no queries found. so sad :(');
        } else {
            if (date)
                log('green', date);
            
            docs.forEach(function(doc) {
                if (!date)
                    log('green', doc.date);
                
                log('yellow', doc.ip);
                    
                doc.urls.forEach(function(current) {
                    var url     = current.url,
                        count   = chalk.green(current.count);
                    
                    log(rendy(urlCount, {
                        url     : url,
                        count   : count
                    }));
                });
            });
        }
        
        process.exit();
    }
    
    function server(db) {
        var express     = require('express'),
            mongoLog    = require('mongolog'),
            app         = express(),
            port        = 1337,
            ip          = '0.0.0.0',
            MSG         = 'url: {{ ip }}:{{ port }}';
        
        app.use(mongoLog({
            db: db
        }));
        
        app.use(express.static(process.cwd()));
        
        http.createServer(app)
            .listen(port, ip);
        
        console.log(rendy(MSG, {
            ip  : ip,
            port: port
        }));
    }
    
    function version() {
        var info = require('../package');
        console.log(info.version);
    }
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: cloudcmd [options]';
        
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
    }
    
    function log(color, msg) {
        var tmpl;
        
        if (!msg) {
            console.log(color);
        } else {
            tmpl = chalk[color]('%s');
            console.log(tmpl, msg);
        }
    }
    
})();
