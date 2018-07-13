const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const express = require('express')
const ngrok = require('ngrok')
const config = require('../config')

const server = express()

const store = {
  localPort: 3000,
}

const startServer = {
  type: 'confirm',
  name: 'start',
  message: 'Start server?',
  default: true,
}

class SandboxCommand extends Command {
  async run() {
    server.get('/', (req, res) => {
      this.log('test')
    })

    const {start} = await inquirer.prompt(startServer)

    if (!start) {
      return this.log("Guess we won't do anything")
    }

    store.serverInstance = await server.listen(store.localPort)
    this.log(`Server is running on port ${store.localPort}`)
    store.tunnelUrl = await ngrok.connect(store.localPort)
    this.log(`Tunnel is running at ${store.tunnelUrl}`)
  }
}

SandboxCommand.description = `Describe the command here
...
Extra documentation goes here
`

SandboxCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = SandboxCommand
