'use strict'

const debug = require('debug')('platziserve:agent')
const EventEmitter = require('events')
const mqtt = require('mqtt')
const defaults = require('defaults')
const { parsePayload } = require('./utils')
const uuid = require('uuid')
const os = require('os')
const util = require('util')

const options = {
    name: 'untitled',
    username: 'platzi',
    interval: 5000,
    mqtt: {
        host: 'mqtt://localhost'
    }
}
class PlatziServeAgent extends EventEmitter {
    constructor(opts) {
        super()

        this._options = defaults(opts, options)
        this._started = false
        this._timer = null
        this._cliente = null
        this._idAgent = null
        this._metrics = new Map()
    }

    addMetric(type, fn) {
        this._metrics.set(type, fn)
    }

    removeMetric(type) {
        this._metrics.delete(type)
    }
    connected() {
        if (!this._started) {
            this._started = true
            this.emit('connected')
            this.opts = this._options
            
            this._cliente = mqtt.connect(options.mqtt.host)
            this._cliente.subscribe('agent/message')
            this._cliente.subscribe('agent/connected')
            this._cliente.subscribe('agent/disconnected')

            this._cliente.on('connect', () => {
                this._idAgent = uuid.v4()
                this.emit('connected', this._idAgent)
                
                this._timer = setInterval(async ()=> {
                    let message    
                    if (this._metrics.size > 0) {
                        message = {
                            agent: {
                                uuid: this._idAgent,
                                name: this.opts.name,
                                username: this.opts.username,
                                hostname: os.hostname() || 'localhost',
                                pid: process.pid
                            },
                            metrics: [],
                            timestamp: new Date().getTime()
                        }

                    
                    }
                    for (let [metric, fn ] of this._metrics) {
                        if (fn.length == 1) {
                            fn = util.promisify(fn)
                        }
                        message.metrics.push({
                            type: metric,
                            value: await Promise.resolve(fn())
                        })
                    }

                    debug('Seding', message)
                    this._cliente.publish('agent/message', JSON.stringify(message))
                    this.emit('message', message)
                }, this.opts.interval)
            })

            this._cliente.on('message', (topic, payload) => {
                payload = parsePayload(payload)

                let broadcast = false
                switch (topic) {
                    case 'agent/connected':
                    case 'agent/disconnected':
                    case 'agent/message':
                      broadcast = payload && payload.agent && payload.agent.uuid !== this._idAgent
                      break
                }
                
                if (broadcast) {
                    this.emit(topic, payload)
                }
                
            })

            this._cliente.on('error', () => this.disconnected());
        }
    }

    disconnected() {
        if (this._started) {
            clearInterval(this._timer)
            this._started = false
            this.emit('disconnected', this._idAgent)
            this._cliente.end()
        }
    }
}

module.exports = PlatziServeAgent