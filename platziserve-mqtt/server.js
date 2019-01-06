'use strict'

const debug = require('debug')('platziserve:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziserve-db')
const { parsePayload } = require('./utils')

const backend = {
    type: 'redis',
    redis,
    return_buffers: true
}

const setting = {
    port: 1883,
    backend
}

const config = {
    database: process.env.DB_NAME || 'platziserve',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s)
}

const server = mosca.Server(setting)

let Agent, Metric
const clientes = new Map()

server.on('clientConnected', (cliente) => {
    debug(`Cliente Connected ${cliente.id}`)
    clientes.set(cliente.id, null)
})

server.on('clientDisconnected', async (cliente) => {
   debug(`Cliente Disconnected ${cliente.id}`)
   const agent = clientes.get(cliente.id)
   if (agent) {
       agent.connected = false

       try {
           await Agent.createdORUpdate(agent)
       } catch (e) {
           handleError(e)
       }

       clientes.delete(cliente.id)
       server.publish({
           topic: 'agent/disconnected',
           payload: JSON.stringify({
               uuid: agent.uuid
           })
       })
       debug(`El cliente con el id ${cliente.id} del agente ${agent.uuid} se ha desconectado`)
   }
})

server.on('published', async (packet, cliente) => {
    debug(`Paquete topic ${packet.topic}`)
    debug(`Payload ${packet.payload}`)

    switch (packet.topic) {
        case 'agent/connected':
        case 'agent/disconnected':
         break
        case 'agent/message':
         const payload = parsePayload(packet.payload)
         if (payload) {
            payload.agent.connected = true
            let agent
            try {
                agent = await Agent.createdORUpdate(payload.agent)
            } catch (e) {
                return handleError(e)
            }
            
            debug(`Agent ${agent.uuid} fue guardado`)
            if (!clientes.get(cliente.id)) {
                clientes.set(cliente.id, agent)
                server.publish({
                    topic: 'agent/connected',
                    payload: JSON.stringify({
                        uuid: agent.uuid,
                        name: agent.name,
                        username: agent.username,
                        hostname: agent.hostname,
                        pid: agent.pid,
                        connected: agent.connected
                    })
                })
            }

            console.log('payload>>>>> ', payload)
            //saved metrics
            for (let m of payload.metrics) {
                let metric
                try {
                    metric = await Metric.create(agent.uuid, m)
                } catch (e) {
                    return handleError(e)
                }

                debug(`Se guardo la metrica ${metric.id} del agente ${agent.uuid}`)
            }
         }
         break
    }
})

server.on('ready', async () => {
    const services = await db(config).catch(getError)
    Agent = services.Agent
    Metric = services.Metric
    console.log(`${chalk.green('[platziserve:mqtt]')} server is running...`)
})

server.on('error', getError)
server.on('uncaughtException', getError)
server.on('unhandledRejection', getError)

function getError(error) {
    console.log(`${chalk.red('[platziserve-error:mqtt:]')} ${error.message}`)
    console.log(`${chalk.red('[plaziserver-error:mqtt:]')} ${error.stack}`)
    process.exit(1)
}

function handleError(error) {
    console.log(`${chalk.red('[error]')} ${error.message}`)
    console.log(error.stack)
}