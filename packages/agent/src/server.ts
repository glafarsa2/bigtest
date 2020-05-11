import { Operation, resource } from 'effection';
import * as xp from 'express';
import * as Path from 'path';
import { Server } from 'http';
import { ensure } from '@bigtest/effection';

interface Options {
  port: number;
  externalURL?: string;
}

export class AgentServer {

  protected constructor(public url: string, protected appDir: string) {}

  static create(options: Options, appDir = Path.join(__dirname, '../app')) {
    if (options.externalURL) {
      return new AgentServer(options.externalURL, appDir);
    } else {
      if (!options.port) {
        throw new Error('An agent server must be created with either an external url or a port number');
      }
      return new HttpAgentServer(options.port, appDir);
    }
  }

  connectURL(connectBackURL: string, agentId?: string) {
    let url = new URL(this.url);
    url.searchParams.append('connectTo', connectBackURL);
    if (agentId) {
      url.searchParams.append('agentId', agentId);
    }
    return url.toString();
  }

  get harnessScriptURL() {
    return `${this.url}/harness.js`;
  }

  *listen(): Operation { return; }

  *join(): Operation { yield; }
}

class HttpAgentServer extends AgentServer {
  http?: Server;
  constructor(private port: number, appDir: string) {
    super(`http://localhost:${port}`, appDir);
  }

  *listen() {
    let express = xp;
    let app = express()
      .use(express.static(this.appDir));

    let server: Server = yield listen(app, this.port);
    this.http = server;

    return yield resource(server, ensure(() => server.close()));
  }

  join(): Operation {
    return ({ resume, ensure }) => {
      if (this.http) {
        this.http.on('close', resume);
        ensure(() => this.http && this.http.off('close', resume));
      } else {
        throw new Error('cannot join a server that is not already listening');
      }
    }
  }

}

function listen(app: xp.Express, port?: number): Operation {
  return ({ resume, fail }) => {
    let server = app.listen(port, (...args: unknown[]) => {
      let [err] = args;
      if (err instanceof Error) {
        fail(err);
      } else {
        resume(server);
      }
    })
  };
};
