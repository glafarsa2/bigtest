# @bigtest/agent

Agent for connecting test environments (browsers) to BigTest

## Synopsis

Bigtest agents are applications that run _in process_ with the system
under test that accept commands on behalf of, and report results back
to, the bigtest server.

This package contains an agent for web browsers, and also a web
application to serve it to browsers.

To start an agent server in process, you can use the
`AgentServer.create()` operation, passing it the websocket url where
the bigtest server will be accepting connections from agents.



``` typescript
import { main } from '@effection/node';
import { AgentServer } from '@bigtest/agent';

main(function* run() {
  let agentServer: AgentServer = yield AgentServer.create('ws://localhost:5000');
  console.log('connect browsers to ${agent.agentAppURL}');
});
```

By default, the agent will connect to a random available port and
serve the agent app from `agent.agentAppURL`;

## Development

Normally, the server will start an agent for you, but in order to
develop the agent code, you'll want to start a development agent at a
given port, and then point your bigtest server at it at the known
location. To do this, run the `start` command.

``` shell
$ yarn start 5000
✨  Built in 501ms.
serving agent application
--> connect agents at http://localhost:56504
--> harness script at http://localhost:56504/harness.js
```

You can now, in your server code, instantiate the AgentServer with the
`AgentServer.external()` method:

``` typescript
let server: AgentServer = yield AgentServer.external('http://localhost:5500', 'ws://localhost:5000');
console.log('connect browsers to ${agent.agentAppURL}');
```

Now, the agent url will connect to the development agent.

To run the tests:

``` sh
$ yarn test
```
