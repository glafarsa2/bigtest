import { main as effectionMain, Context, Operation } from 'effection';

export function main(operation: Operation): Context {
  return effectionMain(({ context: mainContext, spawn }) => {
    spawn(function* main() {
      let interrupt = () => { mainContext.halt(); };
      let debug = () => console.debug(mainContext.toString());
      try {
        process.on('SIGINT', interrupt);
        process.on('SIGUSR1', debug);
        return yield operation;
      } catch(e) {
        console.error(e);
        process.exit(-1);
      } finally {
        process.off('SIGINT', interrupt);
        process.off('SIGUSR1', debug);
      }
    });
  });
}
