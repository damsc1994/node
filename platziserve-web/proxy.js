'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const {endpoint, apitoken} = require('./config')
const request = require('request-promise-native')

const api = asyncify(express.Router())

api.get('/agents', async (req, res, next) => {
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agents`,
        headers: {
            'Authorization': `Bearer ${apitoken}` 
        },
        json :true
    }
    let result
    try {
        result = await request(options)
    } catch(e) {
        return next(e)
    }

    res.status(200).send({
        result
    })
})

api.get('/agent/:uuid', async (req, res, next) => {
    const uuid = req.params.uiid
    const options = {
        method: 'GET',
        url: `${endpoint}/api/agents/${uuid}`,
        headers: {
            'Authorization': `Bearer ${apitoken}` 
        },
        json: true
    }
    let result
    try {
        result = await request(options)
    } catch (e) {
        next(e)
    }

    res.status(200).send({
        result
    })
})

api.get('/metrics/:uuid', (req, res) => {

})

api.get('/metrics/:uuid/:type', (req, res) => {

})


module.exports = api