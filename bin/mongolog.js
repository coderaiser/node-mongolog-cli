(function() {
    'use strict';
    
    var http        = require('http'),
        
        chalk,
        rendy,
        
        argv        = process.argv,
        args        = require('minimist')(argv.slice(2), {
            string: [
                'url'
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
                show(db, 'mongo-log');
            else
                server(db);
        });
    }
    
    function show(db, name) {
        var shortdate   = require('shortdate'),
            date        = shortdate(),
            collection  = db.collection(name);
        
        chalk           = require('chalk');
        
        collection.find({date: date}).toArray(function(error, docs) {
            var urlCount = '{{ url }}: {{ count }}';
            
            if (error)
                console.error(error.message);
            else if (!docs.length)
                log('red', 'today was no queries. so sad :(');
            else
                log('green', date), docs.forEach(function(doc) {
                    log('yellow', doc.ip);
                    
                    doc.urls.forEach(function(current) {
                        var url     = current.url,
                            count   = chalk.green(current.count);
                        
                        log(rendy(urlCount, {
                            url     : url,
                            count   : count
                        }));
                    });
                    
                    process.exit();
                });
        });
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
