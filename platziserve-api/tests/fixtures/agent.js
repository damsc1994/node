'use strict'

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updateAt: new Date()
}

const agents = [
  agent,
  clone(agent, { id: 2, uuid: 'yyyy-yyy-yyx', username: 'platzi2' }),
  clone(agent, { id: 3, uuid: 'yyy-yyy-xxx', connected: false }),
  clone(agent, { id: 4, uuid: 'yyy-xxx-xxx', username: 'caracol' })
]

function clone (obj, value) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, value)
}

module.exports = {
  single: agent,
  find: agents,
  findByConected: () => agents.filter(a => a.connected),
  findByPlatzi: () => agents.filter(a => a.username === 'platzi'),
  finByuuId: (uuid) => agents.filter(a => a.uuid === uuid).shift(),
  findById: (id) => agents.filter(a => a.id === id).shift()
}
