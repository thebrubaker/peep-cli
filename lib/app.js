const vorpal = require('vorpal');
const boxen = require('boxen');
const execa = require('execa');
const Listr = require('listr');
const express = require('express');
const ngrok = require('ngrok');
const Conf = require('conf');

const cli = vorpal();
const server = express();
const config = new Conf();
const store = {
  localPort: 3000,
};

server.get('/', (req, res) => {
  cli.log('test');
  res.send('Success');
});

cli.command('serve', 'Launches the server').action(async (args, callback) => {
  store.serverInstance = await server.listen(store.localPort);
  cli.log(`Server is running on port ${store.localPort}`);
  store.tunnelUrl = await ngrok.connect(store.localPort);
  cli.log(`Tunnel is running at ${store.tunnelUrl}`);
  callback();
});

cli.command('stop', 'Stops the server').action(async (args, callback) => {
  if (store.tunnelUrl) {
    await ngrok.disconnect(store.tunnelUrl);
    cli.log(`Tunnel is no longer available at ${store.tunnelUrl}`);
  }

  if (store.serverInstance) {
    await store.serverInstance.close();
    cli.log('Server has stopped on port 3000');
  }

  callback();
});

cli
  .command('aws', 'View or set your AWS credentials')
  .action(async (args, callback) => {
    const keyResult = await cli.prompt({
      type: 'input',
      message: 'What is your API key?',
      name: 'value',
    });
    const secretResult = await cli.prompt({
      type: 'input',
      message: 'What is your API key?',
      name: 'value',
    });
    cli.log(keyResult.value);
    cli.log(secretResult.value);
    callback();
  });

cli.delimiter('peep$').show();

module.exports = cli;
