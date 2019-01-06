'use strict'

const debug = require('debug')('platziserve:db:setup')
const db = require('./index')
const inquirer = require('inquirer')
const chalk = require('chalk')

const promp = inquirer.createPromptModule()
async function setup () {
  const answer = await promp([
    {
      type: 'confirm',
      name: 'setup',
      message: 'Esta accion eliminara la base de datos, ¿Estas seguro?'
    }
  ])
  if (!answer.setup) {
    return console.log(`${chalk.yellow('>>>>> Cancelaste la accion')}`)
  }
  const config = {
    database: process.env.DB_NAME || 'platziserve',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123',
    host: process.env.DB_HOST || 'localhost',
    setup: true,
    dialect: 'postgres',
    logging: s => debug(s)
  }
  await db(config).catch(getFatalError)

  console.log(`${chalk.green('SUCCESS!!!')}`)
  process.exit(0)
}

function getFatalError (error) {
  console.log(error.message)
  console.log(error.stack)
  process.exit(1)
}

setup()
