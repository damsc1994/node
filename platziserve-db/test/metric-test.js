'use strict'

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const test = require('ava')
const metricFixture = require('../models/fixtures/metric')
const agentFixture = require('../models/fixtures/agent')


let config = {
    logging: function () {}
}

const uuid = 'yyy-yyy-yyy'
let AgentStub = null
let MetricStub = null
let sandbox = null
let db = null
let newMetric = {
    id: 4,
    type: 'platzi',
    value: 'Dato Platzi 4',
    agentId: 1
}
const cod = {
    WHERE : {
        uuid
    }
}

const type = 'platzi'
let codFindMetricAnegtUuid = null
let codfindTypeAgentUuId = null


test.beforeEach('metric#setup', async () => {
 sandbox = sinon.createSandbox()
 MetricStub = {
    belongsTo: sandbox.spy()
 }
 AgentStub = {
    hasMany: sandbox.spy()
 }

 // Model findOne AgentStub
 AgentStub.findOne = sandbox.stub()
 AgentStub.findOne.withArgs(cod).returns(Promise.resolve(agentFixture.finByuuId(uuid))) 

 // Model create MetricStub 
 MetricStub.create = sandbox.stub()
 MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
     toJSON() { return newMetric }
 }))

 //Model findAll MetricStub
 codFindMetricAnegtUuid = {
    attributes: ['type'],
    group: ['type'],
    include: [{
        attributes: [],
        model: AgentStub,
        where: { uuid }
    }],
    raw: true
 }
 codfindTypeAgentUuId = {
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: { type },
    limit: 20,
    order: [['createdAt', 'DESC']],
    include: [{
        attributes: [],
        model: AgentStub,
        where: {uuid}
    }],
    raw: true
 }

 MetricStub.findAll = sandbox.stub()
 MetricStub.findAll.withArgs(codFindMetricAnegtUuid).returns(Promise.resolve(metricFixture.findAgentUuId(uuid)))
 MetricStub.findAll.withArgs(codfindTypeAgentUuId).returns(Promise.resolve(metricFixture.findAgentTypeUuId(type, uuid)))

 const setupDatabase = proxyquire('../index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
 })
 db = await setupDatabase(config)
})

test.serial('Metric', (t) => {
    t.truthy(db.Metric, 'El servidor no ha podido arrancar la configuracion de Metric')
})

test.afterEach(() => {
    sandbox && sandbox.restore()
})

test.serial('metric#create', async (t) => {
    const metric = await db.Metric.create(uuid, newMetric)
    t.true(MetricStub.create.called, 'La funcion no fue llamada')
    t.true(MetricStub.create.calledWith(newMetric), 'La funcion no fue llamada con parametros')
    t.deepEqual(metric, newMetric, 'Los datos devuelto no son iguales')
}) 

test.serial('metric#findAgentUuid', async (t) => {
    const metrics = await db.Metric.findAgentUuId(uuid)
    t.true(MetricStub.findAll.calledOnce, 'La funcion no fue llamada una vez')
    t.true(MetricStub.findAll.calledWith(codFindMetricAnegtUuid), 'La funcion no fue llamada con su argumento')
    t.truthy(metrics, 'La funcion no devolvio datos correctos')
})

test.serial('metric#findTypeAgentUuId', async (t) => {
    const metrics = await db.Metric.findTypeAgentUuId(uuid, type)
    t.true(MetricStub.findAll.called, 'La funcion no fue llamada una vez')
    t.true(MetricStub.findAll.calledOnce, 'La funcion no fue llamada una vez')
    t.true(MetricStub.findAll.calledWith(codfindTypeAgentUuId), 'La funcion no fue llamada con sus argumentos')
    t.truthy(metrics, 'La funcion no devolvio datos correctos')
})