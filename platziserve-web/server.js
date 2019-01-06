'use strict'

const debug = require('debug')('platziserve:web')
const http = require('http')
const express = require('express')
const chalk = require('chalk')
const path =require('path')
const socketIo = require('socket.io')
const { pipe } = require('./util')
const PlatziserveAgent = require('platziserve-agent')
const proxy = require('./proxy')
const asyncify = require('express-asyncify')

const port = 8080
const app = asyncify(express())
const server = http.createServer(app)
const io = socketIo(server)
const agent = new PlatziserveAgent()

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)
io.on('connection', function(socket) {
    debug(`Se ha conectado el cliente ${socket.id}`)
    pipe(agent, socket)

})

app.use((error, req, res, next) => {
    if (error.message.match(/not found/)) {
        return res.status(404).send({message: `${chalk.red(error)}`})
    }
    res.status(500).send({message: `${chalk.red(error)}`})
})

function getFatalError(error) {
    console.log(`${chalk.red(`[platziserve:web:error:]`)} ${error.message}`)
    console.log(error.stack)
    process.exit(1)
}

process.on('uncaughtException', getFatalError)
process.on('unhandledRejection', getFatalError)
server.listen(port, () => {
    debug(`${chalk.green(`El servidor platziserve:web ha iniciado.`)}`)
    agent.connected()
})