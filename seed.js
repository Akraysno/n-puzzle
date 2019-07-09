const glob  = require('glob')
const exec  = require('child_process').exec
const chalk = require('chalk')

const log = (text) => chalk.green

glob('./seeds/*.json', (err, files) => {
    if (err) {
        return console.error(err)
    }

    files.forEach((file) => {
        const filename = file.split('/').slice(-1)[0]
        const collectionName = filename.split('.')[0]
        console.log('['+chalk.green('SEEDING'), collectionName+' -> ' + file + ']')
        exec(`mongoimport --verbose --db n-puzzle --collection ${collectionName} --file ${file} --jsonArray`, (err, stdout, stderr) => {
            console.error(stderr)
        })
    })
})
