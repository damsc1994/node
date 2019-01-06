'use strict'

module.exports = function setupAgent (AgentModel) {
  return {
    findById: (id) => AgentModel.findById(id),
    createdORUpdate: async function (agent) {
      const cod = {
        where: {
          uuid: agent.uuid
        }
      }
      const existAgent = await AgentModel.findOne(cod)
      if (existAgent) {
        const updated = await AgentModel.update(agent, cod)
        return updated ? AgentModel.findOne(updated.id) : existAgent
      }

      const newAgent = await AgentModel.create(agent)
      return newAgent.toJSON()
    },
    findByUuId: async function (uuid) {
      const cod = {
        where: {
          uuid
        }
      }
      return AgentModel.findOne(cod)
    },
    findAll: () => AgentModel.findAll(),
    findConnected: function (connected) {
      const cod = {
        WHERE: {
          connected: connected
        }
      }

      return AgentModel.findAll(cod)
    },
    findUserName: function (username) {
      const cod = {
        WHERE: {
          username
        }
      }

      return AgentModel.findAll(cod)
    }
  }
}
