'use strict'

const db = require('../index')
async function  run() {
    const config = {
        database: process.env.DB_NAME || 'platziserve',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '123',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
    }
    const { Agent, Metric } = await db(config).catch(getError)

    const agent = await Agent.createdORUpdate({
        id: 1,
        uuid: 'yyyy',
        name: 'test2',
        userName: 'test',
        hostname: 'test',
        pid: 1,
        connected: true
    }).catch(getError)

    console.log('--agent--')
    console.log(agent)

    const agents = await Agent.findAll().catch(getError)
    console.log('--agents--')
    console.log(agents) 

    const metric = await Metric.create(agent.uuid, {
        type: 'luces',
        value: 'led'
    }).catch(getError)
    console.log('--metric--')
    console.log(metric)

    const metrics = await Metric.findAgentUuId(agent.uuid)
    console.log('--Metrics--')
    console.log(metrics)

    const metrycsTypeAgent = await Metric.findTypeAgentUuId(agent.uuid, 'memoria').catch(getError)
    console.log('--Metrics Type-Agent --')
    console.log(metrycsTypeAgent)
}

function getError(error) {
    console.log(error.message)
    console.log(error.stack)
    process.exit(1)
}


run()