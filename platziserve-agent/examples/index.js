'use strict'

const PlatziServeAgent = require('../index')

const agent = new PlatziServeAgent({
    name: 'myapp',
    username: 'admin',
    interval: 2000
})


agent.addMetric('rs', function getRss(){
    return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise() {
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getCalbackMetric(callback) {
    setTimeout(() => {
        callback(null, Math.random())
    }, 1000)
})

agent.connected()
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

agent.on('agent/connected', handler)
agent.on('agent/disconneted', handler)
agent.on('agent/message', handler)

function handler(payload) {
    console.log('playloda', payload)
}

setTimeout(() => agent.disconnected(), 10000)