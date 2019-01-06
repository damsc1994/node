'use strict'

const debug = require('debug')('platziserve:api:test')
const test = require('ava')
const request = require('supertest')
const server = require('../server')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const AgentFixture = require('./fixtures/agent')
const util = require('util')
const auth = require('../auth')
const config = require('../config')

const sign = util.promisify(auth.sign)
let sandbox = null
let dbStub = null
let AgentStub = null
let MetricStub = null
let serv = null
let token = null

test.beforeEach(async () => {
    sandbox = sinon.createSandbox()

    dbStub = sandbox.stub()
    dbStub.call(Promise.resolve({
        AgentStub,
        MetricStub
    }))

    token = await sign({admin: true, username: 'admin'}, config.auth.secret) 

    const api = proxyquire('../api', {
        'platziserveDB': dbStub
    })

    serv = proxyquire('../server', {
        './api': api
    })
})

test.afterEach(async () => {
    sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
    debug('test')
    request(server)
     .get('/api/agents')
     .expect(200)
     .set('Authorization', `Bearer ${token}`)
     .expect('content-type',/json/)
     .end((err, res) => {
        let body = JSON.stringify(res.body);
        t.falsy(err, 'Hubo un error en api/agents')
        t.truthy(body, 'api/agents no trajo los datos esperados')
        t.end()
     })
})

test.serial.todo('/api/agent/:uuid')
test.serial.todo('/api/agent/:uuid - not found')

test.serial.todo('/api/metrics/:uuid')
test.serial.todo('/api/metrics/:uuid - not found')

test.serial.todo('/api/metrics/:uuid/:type')
test.serial.todo('/api/metrics/:uuid/:type - not found')