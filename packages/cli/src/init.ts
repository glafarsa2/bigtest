import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { promises as fs } from 'fs';
import * as path from 'path';

import { Prompt } from './prompt';

export function* init(configFile: string): Operation<void> {
  let prompt = yield Prompt.create();

  let options: Partial<ProjectOptions>;

  try {
    options = JSON.parse(yield fs.readFile(path.resolve(configFile)));
  } catch {
    options = {
      port: 24000,
      launch: ['chrome.headless']
    };
  }

  if(!options.app) { options.app = {} }

  options.port = yield prompt.number('Which port would you like to run BigTest on?', {
    name: 'port',
    defaultValue: options.port,
    min: 0,
    max: 65535,
  })

  options.testFiles = [yield prompt.string('Where are your test files located?', {
    name: 'testFiles',
    defaultValue: (options.testFiles || [])[0] || 'test/**/*.test.{ts,js}',
  })]

  if(yield prompt.boolean('Do you want BigTest to start your application for you?', { defaultValue: true })) {
    options.app.command = yield prompt.string('What command do you run to start your application?', {
      name: 'app.command',
      defaultValue: options.app.command || 'yarn start',
    })
    options.app.env = {
      PORT: yield prompt.number('Which port would you like to run your application on?', {
        name: 'app.env.PORT',
        defaultValue: Number(options.app.env?.PORT) || ((options.port || 0) + 1),
        min: 0,
        max: 65535,
      })
    }
    options.app.url = yield prompt.string('Which URL do you use to access your application?', {
      name: 'app.url',
      defaultValue: options.app.url || `http://localhost:${options.app.env.PORT}`,
    });
  } else {
    delete options.app.command;
    delete options.app.env;
    options.app.url = yield prompt.string('Which URL do you use to access your application?', {
      name: 'app.url',
      defaultValue: options.app.url,
    });
  }

  yield fs.mkdir(path.dirname(configFile), { recursive: true });
  yield fs.writeFile(configFile, JSON.stringify(options, null, 2) + '\n');
}
