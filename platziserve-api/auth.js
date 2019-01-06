'use strict'

const jsonwebtoken = require('jsonwebtoken')

function sign(payload, secret, cb) {
    return jsonwebtoken.sign(payload, secret, cb)
}

function verify(payload, secret, cb) {
    return jsonwebtoken.verify(payload, secret, cb)
}

module.exports = {
    sign,
    verify
}