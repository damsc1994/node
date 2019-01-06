'use strict'

const debug = require('debug')('platziserve:api:route')
const express = require('express')
const asyncify = require('express-asyncify')
const platziserveDB = require('platziserve-db')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()

const api = asyncify(express.Router())
const config = require('./config')

let services, Agent, Metric;

api.use("*", async (req, res, next) => {
    if (!services) {
        debug('Conectando a la base de datos')
        try {
           services = await platziserveDB(config.db)
        } catch(e) {
            nex(e)
        }

        Agent = services.Agent
        Metric = services.Metric
    }
    
    next()
})

api.get('/agents', auth(config.auth) ,async (req, res, next) => {
    const { user } = req
    if (!user || !user.username) {
        return new Error('No tienes permiso de ver esta informacion')
    }
    let agents
    try {
        if (user.admin) {
            agents = await Agent.findConnected()
        } else {
            agents = await Agent.findUserName(user.username)
        }
    } catch (e) {
        next(e)
    }
  res.status(200).send({
    agenst: agents
  })
})

api.get('/agent/:uuid', async (req, res, next) => {
    const { uuid } = req.params
    let agent
    try {
        agent = await Agent.findByUuId(uuid)
    } catch (e) {
        next(e)
    }

    if (!agent) return next(new Error(`No se a encontrado el agente ${uuid}`))

    res.status(200).send({
        agent
    })
})

api.get('/metrics/:uuid', [auth(config.auth), guard.check(['metrics:read'])], async (req, res, next) => {
    const { uuid } = req.params
    let metricsType
    try {
        metricsType = await Metric.findAgentUuId(uuid)
    } catch (e) {
        next(e)
    }

    if (!metricsType || metricsType.length === 0) return next(new Error(`No se a encontrado el la metric con el agente ${uuid}`)) 

    res.status(200).send({
        metricsType
    })
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
    const { uuid, type } = req.params
    let metrics
    try {
        metrics = await Metric.findTypeAgentUuId(uuid, type)
    } catch (e) {
        next(e)
    }
    
    if (!metrics || metrics.length === 0) return next(new Error(`No se a encontrado el la metric con el agente ${uuid}`)) 
    
    res.status(200).send({
        metrics
    })
})

module.exports = api