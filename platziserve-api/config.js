'use strict'

const debug = require('debug')

const config = {
    db: {
        database: process.env.DB_NAME || 'platziserve',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '123',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: s => debug(s)
    },
    auth: {
       secret: process.env.SECRET || 'platzi' 
    } 
}
module.exports = config;