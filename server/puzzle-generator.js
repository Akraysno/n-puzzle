const exec  = require('child_process').exec
const chalk = require('chalk')
const fs = require('fs')
const mkdirp = require('mkdirp');
const moment = require('moment')
const log = (text) => chalk.green

console.log('['+chalk.green('GENERATE')+']')
exec(`python ./scripts/puzzle-generator.py 4 -s`, (err, stdout, stderr) => {
    console.log(stdout)

    mkdirp('./puzzles', function(err) { 

        // path exists unless there was an error

    });
    var filename = `./puzzles/puzzle-${moment().format('YYYYMMDD_HHmmss')}`
    fs.writeFile(filename, stdout, function(err) {
        if(err) {
            return console.log(err);
        } else {
            console.log('['+chalk.green('GENERATED')+']', filename)
        }
    });
})
