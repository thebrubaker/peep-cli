const tasks = new Listr([
  {
    title: 'Step 1',
    task: (ctx, task) => execa.stdout('npm', ['-v']),
  },
]);

vorpal
  .command('boxen', 'Demonstrates boxen.')
  .action(function(arguments, callback) {
    this.log(
      boxen('Boxen Works!', {
        padding: 1,
        borderColor: 'blue',
        borderStyle: 'double',
      }),
    );
    callback();
  });

vorpal.command('Listr', 'Demo Listr').action(function(arguments, callback) {
  tasks
    .run()
    .then(() => {
      callback();
    })
    .catch(err => {
      this.error(err);
      callback();
    });
});
