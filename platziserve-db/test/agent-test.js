'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const agentFixture = require('../models/fixtures/agent')

let config = {
  logging: function () {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}
let AgentStub = null

let db = null
let sandbox = null
let single = Object.assign({}, agentFixture.single)
let id = 1
let uuid = 'yyy-yyy-yyy'
let cod = {
  where: {
    uuid: uuid
  }
}
let newAgent = {
  id: 6,
  uuid: '123-123-123',
  name: 'new agent',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updateAt: new Date()
}
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }
  // Modelo Agent findByOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(single).returns(Promise.resolve(single))
  AgentStub.findOne.withArgs(cod).returns(Promise.resolve(single))
  AgentStub.findOne.withArgs(single.id).returns(Promise.resolve(single))

  // Modelo Agent update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, cod).returns(Promise.resolve(single))

  //  Modelo Agent findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixture.findById(id)))

  // Model Agent findByUuId Stub
  AgentStub.findByUuId = sandbox.stub()
  AgentStub.findByUuId.withArgs(uuid).returns(Promise.resolve(agentFixture.finByuuId(uuid)))

  // Model Agent findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.returns(Promise.resolve(agentFixture.find))

  // Model Agent create Strub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model Agent findConneted
  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.withArgs(true).returns(Promise.resolve(agentFixture.findByConected()))

  const setupDatabase = proxyquire('../index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial('Agent', (t) => {
  t.truthy(db.Agent, 'El servicio de Agente paso la prueba')
})

test.serial('setup', (t) => {
  t.true(AgentStub.hasMany.called, 'La funcion hasMany de Agent no fue llamado')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'La funcion con agumento de Agent no fue llamado')
  t.true(MetricStub.belongsTo.called, 'La funcion belongTo de Metric no fue llamada')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'La funcion con agumento de metric no fue llamada')
})

test.serial('agent#findById', async (t) => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'La funcion no fue llamada')
  t.true(AgentStub.findById.calledWith(id), 'La funcion no se llamo con el argumento correcto')
  t.true(AgentStub.findById.calledOnce, 'La funcion no fue llamada una sola ves')

  t.deepEqual(agent, agentFixture.findById(id), 'La funcion id no a devuelto el resultado esperado')
})

test.serial('agent#createdOrUpdate --exist', async (t) => {
  let agent = await db.Agent.createdORUpdate(single)
  t.true(AgentStub.findOne.called, 'La funcion no fue llamada correctamente')
  t.true(AgentStub.findOne.calledTwice, 'La funcion no fue llama dos veces')
  t.true(AgentStub.findOne.calledWith(single), 'La funcion no fue llamada con un parametro correctamente')
  t.deepEqual(agent, single, 'La funcion uuid no devolvio resultado iguales')
})

test.serial('agent#createdOrUpdate --No exist', async (t) => {
  let agent = await db.Agent.createdORUpdate(newAgent)

  t.true(AgentStub.create.called, 'La funcion no fue llamada correctamente')
  t.true(AgentStub.create.calledWith(newAgent), 'La funcion no fue llamada correctamente con un parametro')
  t.deepEqual(agent, newAgent, 'La funcion no retorno datos iguales')
})

test.serial('agent#findByUuid', async (t) => {
  let agent = await db.Agent.findByUuId(uuid)
  t.true(AgentStub.findOne.called, 'La funcion no fue llamada correctamente')
  t.true(AgentStub.findOne.calledOnce, 'La funcion no fue llamada una ves')
  t.true(AgentStub.findOne.calledWith(cod), 'La funcion no fue llamada con el parametro')
  t.deepEqual(agent, agentFixture.finByuuId(uuid), 'La funcion no ha devuelto valores iguales')
})

test.serial('agent#findAll', async (t) => {
  let agents = await db.Agent.findAll()
  t.true(AgentStub.findAll.called, 'La funcion no fue llamada correctamente')
  t.true(AgentStub.findAll.calledOnce, 'La funcion no fue llamada una sola ves')
  t.deepEqual(agents, agentFixture.find, 'La funcion no ha devuelto valores iguales')
})

test.serial('agent#findConnected', async (t) => {
  let agentsConneted = await db.Agent.findConnected(true)
  t.true(AgentStub.findAll.called, 'La funcion fue llamaa correctamente')
  t.truthy(agentsConneted, 'La funcion no retorno datos valido')
})

test.serial('agent#findUserName', async (t) => {
  let agents = await db.Agent.findUserName('platzi')
  t.true(AgentStub.findAll.called, 'La funcion no fue llamada correctamente')
  t.true(AgentStub.findAll.calledOnce, 'La funcion no fue llamauna sola ves')
  t.truthy(agents, 'La funcion no retorno datos validos')
})
