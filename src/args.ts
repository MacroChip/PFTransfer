import * as yargs from "yargs";
const argv =
yargs
  .command('send', 'send a file', (yargs) => {
    return yargs
      .option('f', {
        describe: 'file to send',
        type: 'string',
        demand: 'please specify a file to send',
        nargs: 1,
      })
      .option('r', {
        describe: 'file recipient',
        type: 'string',
        demand: 'please specify a recipient for the file you are sending',
        nargs: 1,
      });
  })
  .command('receive', 'receive a file', (yargs) => {
    return yargs
      .option('f', {
        describe: 'filename that received file will be saved to',
        type: 'string',
        nargs: 1,
      })
      .option('i', {
        describe: 'identity',
        type: 'string',
        demand: 'please specify an identity. This must match the sender\'s "r" flag argument',
        nargs: 1,
      });
  })
  .command('server', 'broker a file between two parties')
  .example('pftransfer send -f file -r recipient', "here's how you use it")
  .demandCommand(1, 'Please specify one of the commands!')
  .strict()
  .option('s', {
      alias: 'server',
      type: 'string',
      describe: 'Optional parameter to specify the api server to use',
      default: 'http://localhost:8080'
  })
  .help('h')
  .alias('h', 'help')
  .wrap(null)
  .argv;

export {
    argv
};
