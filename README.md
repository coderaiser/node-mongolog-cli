Mongolog-cli
=======

Command line interface to [mongolog](https://github.com/coderaiser/node-mongolog "Mongolog").

## Install

`npm i mongolog-cli -g`

## Hot to use?

Mongolog-cli supports command line parameters:

|Parameter              |Operation
|:----------------------|:--------------------------------------------
| `-h, --help`          | display help and exit
| `-v, --version`       | output version information and exit
| `--url`               | url to mongodb server
| `--date`              | show logs by date in yyyy.mm.dd format
| `--ip`                | show logs from ip
| `--server`            | start mongo-log server

## Example

```sh
> mongolog --url localhost:27017/myproject
2015.03.30
127.0.0.1
/cloudcmd/img/txt.png: 6
/cloudcmd/json/modules.json: 6
/cloudcmd/api/v1/config: 6
/api/v1/fs/home/coderaiser/mongolog/lib/mongolog.js?hash: 1
```
With option `--server` you could start static server in current working directory with `mongolog` logging support.

## License

MIT

