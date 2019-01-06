'use strict'
const agentFixture = require('./agent')

const metric = {
    id: 1,
    type: 'platzi',
    value: 'Dato Platzi',
    agentId: 1
}

const metrics = [
    metric,
    cloneMetric(metric, {id: 2, value: 'Dato Platzi 2'}),
    cloneMetric(metric, {id: 3, value: 'Dato platzi 3', type: 'platzi-aux', agentId: 2})
]

function cloneMetric(obj, value) {
    const clone = Object.assign({}, obj)
    return Object.assign(clone, value)
}

module.exports = {
    metric,
    metrics,
    findAgentUuId: (uuid) => metrics.filter(m => m.agentId === agentFixture.finByuuId(uuid).id),
    findAgentTypeUuId: (type, uuid) => metrics.filter(m => m.type === type 
        && m.agentId === agentFixture.finByuuId(uuid).id)
}