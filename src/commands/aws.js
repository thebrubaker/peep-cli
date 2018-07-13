const {Command, flags} = require('@oclif/command')
const inquirer = require('inquirer')
const path = require('path')
const homedir = require('os').homedir()
const fs = require('fs-extra')
const readline = require('readline')

const credentialsPath = path.join(homedir, '/.aws/credentials')

const awsId = {
  type: 'input',
  name: 'id',
  message: 'What is your AWS access key ID?',
  validate(input) {
    if (!input) {
      return Promise.reject('The access key ID is required.')
    }

    return Promise.resolve(true)
  },
}

const awsSecret = {
  type: 'input',
  name: 'secret',
  message: 'What is your AWS access key secret?',
  validate(input) {
    if (!input) {
      return Promise.reject('The access key secret is required.')
    }

    return Promise.resolve(true)
  },
}

class AwsCommand extends Command {
  async run() {
    const {flags} = this.parse(AwsCommand)

    // Ensure the file exists / create the file
    await this.fileExistsOrMakeFile(credentialsPath)

    // Verify user can read / write to file
    await this.canAccessFile(credentialsPath)

    // If new flag, we remove the file's data so we can write new credentials
    if (flags.new) {
      await this.removeDataFromFile(credentialsPath)
    }

    // Now we check to see if credentials have already been set
    const hasCredentials = await this.checkCredentials(credentialsPath)

    if (!hasCredentials) {
      // If no credentials, we want to prompt new credentials
      this.log('')
      const answers = await inquirer.prompt([awsId, awsSecret])

      // And write them to the file
      await this.writeCredentials(credentialsPath, answers.id, answers.secret)

      this.log('')
      this.log(`Credentials saved to ${credentialsPath}`)
    }

    // Finally we log the credentials to the user to preview
    this.log('')
    await this.logCredentials(credentialsPath)
  }

  async fileExistsOrMakeFile(path) {
    try {
      await fs.ensureFile(path)
    } catch (error) {
      this.log('')
      this.log(`Created AWS credentials file at ${path}`)
    }

    return path
  }

  async removeDataFromFile(path) {
    await fs.truncate(path, 0)
    this.log('')
    this.log(`Removed old credentials from ${path}`)

    return true
  }

  async canAccessFile(path) {
    try {
      await fs.access(path, fs.constants.R_OK | fs.constants.W_OK)
    } catch (e) {
      this.log('')
      this.log(`Cannot read / write AWS credentials file at ${path}`)
      throw e
    }

    return path
  }

  async writeCredentials(path, id, secret) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(path, {flags: 'a'})

      stream.on('close', resolve)

      stream.write('[default]\n', 'utf8')
      stream.write(`aws_access_key_id = ${id}\n`, 'utf8')
      stream.write(`aws_secret_access_key = ${secret}\n`, 'utf8')

      stream.end()
    })
  }

  async checkCredentials(path) {
    const data = await fs.readFile(path, 'utf8')

    return Boolean(data.length)
  }

  async logCredentials(path) {
    const credentials = await fs.readFile(path, 'utf8')

    this.log(credentials)

    return credentials
  }
}

AwsCommand.description = `View or set your AWS credentials
Credentials file is located at ${credentialsPath}
`

AwsCommand.flags = {
  new: flags.boolean({
    char: 'n',
    description: 'Replace your current credentials with new values.',
  }),
}

module.exports = AwsCommand
