import { main } from '@effection/node';
import { setLogLevel, Levels } from '@bigtest/logging';

import { createServer } from '../src/index';

setLogLevel(process.env.LOG_LEVEL as Levels || 'info');

main(createServer({
  port: 24002,
  app: {
    command: "yarn",
    args: ["test:app:start", "24000"],
    env: {},
    port: 24000,
  },
  proxy: {
    port: 24001,
  },
  connection: {
    port: 24003,
  },
  agent: {
    port: 24004,
  },
  manifest: {
    port: 24005,
  },
  testFiles: ["./test/fixtures/*.t.js"],
  cacheDir: "./tmp/start",
  drivers: {
    "chrome": {
      browserName: "chrome",
      headless: true
    },
    "firefox": {
      browserName: "firefox",
      headless: true
    }
  },
  launch: {
    "chrome": { },
    "firefox": { }
  }
}));
