'use strict'

const debug = require('debug')('platziserve:api')
const http = require('http')
const express = require('express')
const chalk = require('chalk')
const api = require('./api')
const asyncify = require('express-asyncify')

const port = process.PORT || 3000
const app = asyncify(express())
const server = http.createServer(app)
 
app.use('/api', api)
app.use((error, req, res, next) => {
    
    if (error.message.match(/not found/)) {
        return res.status(404).send({message: `${chalk.red(error)}`})
    }
    res.status(500).send({message: `${chalk.red(error)}`})
})

function handleFatalError(error) {
    console.log(`${chalk.red('[platziserve:api] Fatal Error')} ${error.message}`)
    console.log(error.stack)
    process.exit(1)
}

if (!module.parent) {
    process.on('uncaughtException', handleFatalError)
    process.on('unhandledRejection', handleFatalError)
    server.listen(port, () => {
        console.log(`${chalk.green('[platziserve:api]')} el servidor a arrancado en el puerto ${port}`)
    })
}

module.exports = server



