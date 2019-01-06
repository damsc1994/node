'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
    return {
        create : async function (uuid, metric) {
            const agent = await AgentModel.findOne({
                WHERE: {uuid}
            })
            if (agent) {
                metric.agentId = agent.id
                const created = await MetricModel.create(metric)
                return created.toJSON()
            }
        },
        findAgentUuId: async  function(uuid) {
            const metrics = await MetricModel.findAll({
                attributes: ['type'],
                group: ['type'],
                include: [{
                    attributes: [],
                    model: AgentModel,
                    where: { uuid }
                }],
                raw: true
            })

            return metrics
        },
        findTypeAgentUuId: async function(uuid, type) {
            return await MetricModel.findAll({
                attributes: ['id', 'type', 'value', 'createdAt'],
                where: { type },
                limit: 20,
                order: [['createdAt', 'DESC']],
                include: [{
                    attributes: [],
                    model: AgentModel,
                    where: {uuid}
                }],
                raw: true
            })
        }
    }
}