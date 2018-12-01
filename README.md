![Moleculer logo](http://moleculer.services/images/banner.png)

[![Build Status](https://travis-ci.org/smart-matrix/moleculer-gundb.svg?branch=master)](https://travis-ci.org/smart-matrix/moleculer-gundb)
[![Coverage Status](https://coveralls.io/repos/github/smart-matrix/moleculer-gundb/badge.svg?branch=master)](https://coveralls.io/github/smart-matrix/moleculer-gundb?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/<----hash----->)](https://www.codacy.com/app/<---username---->/moleculer-gundb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=smart-matrix/moleculer-gundb&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/smart-matrix/moleculer-gundb/badges/gpa.svg)](https://codeclimate.com/github/smart-matrix/moleculer-gundb)
[![David](https://img.shields.io/david/smart-matrix/moleculer-gundb.svg)](https://david-dm.org/smart-matrix/moleculer-gundb)
[![Known Vulnerabilities](https://snyk.io/test/github/smart-matrix/moleculer-gundb/badge.svg)](https://snyk.io/test/github/smart-matrix/moleculer-gundb)
[![Join the chat at https://gitter.im/moleculerjs/moleculer](https://badges.gitter.im/moleculerjs/moleculer.svg)](https://gitter.im/moleculerjs/moleculer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# moleculer-gundb [![NPM version](https://img.shields.io/npm/v/moleculer-gundb.svg)](https://www.npmjs.com/package/moleculer-gundb)

GunDB Gateway for MoleculerJS

## Features

## Install
```
npm install moleculer-gundb --save
```

## Usage


# Test
```
$ npm test
```

In development with watching

```
$ npm run ci
```

# Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

# Contact
Copyright (c) 2018 Fathym, Inc

[![@icebob](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)

![LOGO](https://raw.githubusercontent.com/tiaod/moleculer-io/master/examples/assets/logo.png)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/smart-matrix/moleculer-gundb/master/LICENSE)
[![npm](https://img.shields.io/npm/v/moleculer-io.svg)](https://www.npmjs.com/package/moleculer-io)

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Moleculer-io](#moleculer-io)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
	- [Init server](#init-server)
	- [Handle socket events](#handle-socket-events)
	- [Handle multiple events](#handle-multiple-events)
	- [Custom handler](#custom-handler)
	- [Handler hooks](#handler-hooks)
	- [Calling options](#calling-options)
	- [Middlewares](#middlewares)
	- [Authorization](#authorization)
		- [Make authorization on connection](#make-authorization-on-connection)
	- [Joining and leaving rooms](#joining-and-leaving-rooms)
	- [Broadcast](#broadcast)
	- [Full settings](#full-settings)
- [Change logs](#change-logs)
- [License](#license)

<!-- /TOC -->

# Moleculer-io

The `moleculer-io` is the API gateway service for [Moleculer](https://github.com/moleculerjs/moleculer) using `socket.io`. Use it to publish your services.

# Features

-   Call moleculer actions by emiting Socket.io events.
-   Support Socket.io authorization (Default: `socket.client.user` => moleculer `ctx.meta.user`)
-   Whitelist.
-   Middlewares.
-   Broadcast events.
-   Joining and leaving rooms.

# Install

```shell
$ npm install moleculer-io
```

# Usage

## Init server

Using with Node http server:

```javascript
const server = require('http').Server(app)
const SocketIOService = require("moleculer-io")
const ioService = broker.createService({
  name: 'io',
  mixins: [SocketIOService]
})

ioService.initServer(server)
// Once the initServer() was called, you can access the io object from ioService.io
broker.start()
server.listen(3000)
```

Or let moleculer-io create a server for you:

```javascript
const ioService = broker.createService({
  name: 'io',
  mixins: [SocketIOService]
})
ioService.initServer(3000)
broker.start()
```

More simple:

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings:{
    port:3000 //will call initServer() on broker.start()
  }
})
broker.start()
```

Or maybe you want to use it with `moleculer-web`

```js
const ApiService = require("moleculer-web");
const SocketIOService = require("moleculer-io")
broker.createService({
  name: 'gw',
  mixins: [ApiService,SocketIOService], //Should after moleculer-web
	settings: {
		port: 3000
	}
})
broker.start()
```

`moleculer-io` will use the server created by `moleculer-web` automatically.

## Handle socket events

Server:

```javascript
const IO = require('socket.io')
const { ServiceBroker } = require('moleculer')
const SocketIOService = require('moleculer-io')

const broker = new ServiceBroker({
  logger: console,
  metrics:true,
  validation: true
})

broker.createService({
	name: "math",
	actions: {
		add(ctx) {
			return Number(ctx.params.a) + Number(ctx.params.b);
		}
	}
})

const ioService = broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings: {
    port: 3000
  }
})

broker.start()
```

By default, `moleculer-io` handle the `call` event which will proxy to moleculer's `broker.call`

Examples:

-   Call `test.hello` action without params: `socket.emit('call','test.hello', callback)`
-   Call `math.add` action with params: `socket.emit('call','math.add', {a:25, b:13}, callback)`
-   Get health info of node: `socket.emit('call','$node.health', callback)`
-   List all actions: `socket.emit('call', '$node.list', callback)`

**Example client:**

```javascript
const io = require('socket.io-client')
const socket = io('http://localhost:3000')
socket.emit('call','math.add',{a:123, b:456},function(err,res){
  if(err){
    console.error(err)
  }else{
    console.log('call success:', res)
  }
})
```

## Handle multiple events

You can create multiple routes with different whitelist, calling options & authorization.

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings: {
    port: 3000,
    namespaces: {
      '/':{
        events: {
          'call':{
            whitelist: [
              'math.add'
            ],
            callOptions: {}
          },
          'adminCall': {
            whitelist: [
              'users.*',
              '$node.*'
            ]
          }
        }
      }
    }
  }
})
```

## Custom handler

You can make use of custom functions within the declaration of event handler.

```javascript
broker.createService({
  name:'io',
  mixins: [SocketIOService],
  settings: {
    port:3000,
    namespaces: {
      '/':{
        events:{
          'call':{},
          'myCustomEventHandler': function(data, ack){ // write your handler function here.
            let socket = this
            socket.emit('hello', 'world')
          }
        }
      }
    }
  }
})
```

## Handler hooks

The event handler has before & after call hooks. You can use it to set ctx.meta, access socket object or modify the response data.

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings: {
    namespaces: {
      '/':{
        events:{
          'call':{
            whitelist: [
              'math.*'
            ],
            before: async function(ctx, socket, args){ //before hook
              //args: An object includes { action, params, callOptions }
              console.log('before hook:', args)
            },
            after:async function(ctx, socket, res){ //after hook
              console.log('after hook', res)
              // res: The respose data.
            }
          }
        }
      }
    }
  }
})
```

## Calling options

The handler has a callOptions property which is passed to broker.call. So you can set timeout, retryCount or fallbackResponse options for routes.

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings:{
    namespaces:{
      '/':{
        events:{
          'call':{
            callOptions:{
              timeout: 500,
              retryCount: 0,
              fallbackResponse(ctx, err) { ... }
            }
          }
        }
      }
    }
  }
})
```

Note: If you provie a meta field here, it replace the getMeta method's result.

## Middlewares

Register middlewares. Both namespace middlewares and packet middlewares are supported.

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings:{
    namespaces: {
      '/': {
        middlewares:[ //Namespace level middlewares, equipment to namespace.use()
          function(socket, next) {
             if (socket.request.headers.cookie) return next();
             next(new Error('Authentication error'));
           }
        ],
        packetMiddlewares: [ // equipment to socket.use()
          function(packet, next) {
             if (packet.doge === true) return next();
             next(new Error('Not a doge error'));
           }
        ],
        events:{
          'call': {}
        }
      }
    }
  }
})
```

**Note:** In middlewares the `this` is always pointed to the Service instance.

## Authorization

You can implement authorization. For this you need to add an handler.

```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings: {
    namespaces: {
      '/':{
        events:{
          'call':{
            whitelist: [
              'math.*',
              'accounts.*'
            ]
          }
        }
      }
    }
  }
})

broker.createService({
  name: 'accounts',
  actions: {
    login(ctx){
      if(ctx.params.user == 'tiaod' && ctx.params.password == 'pass'){
        ctx.meta.user = {id:'tiaod'} // This will save to socket.client.user
      }
    },
    getUserInfo(ctx){
      return ctx.meta.user //Once user was logged in, you can get user here.
    }
  }
})
```

Client:

```javascript
socket.emit('login', 'accounts.login', {user: 'tiaod', password: 'pass'}, function(err,res){
  if(err){
    alert(JSON.stringify(err))
  }else{
    console.log('Login success!')
  }
})
```

See `examples/simple`

Also you could overwrite the getMeta method to add more addition meta info. The default getMeta method is:

```javascript
getMeta(socket){
  return {
    user: socket.client.user,
    $rooms: Object.keys(socket.rooms)
  }
}
```

Example to add more additional info:

```javascript
broker.createService({
  name:'io',
  mixins: [SocketIOService],
  methods:{
    getMeta(socket){ //construct the meta object.
      return {
        user: socket.client.user,
        $rooms: Object.keys(socket.rooms),
        socketId: socket.id
      }
    }
  }
})
```

By default, `ctx.meta.user` will save to `socket.client.user`, you can also overwrite it.
The default `saveUser` method is:

```javascript
saveUser(socket,ctx){
	socket.client.user = ctx.meta.user
}
```

### Make authorization on connection

If you don't want to emit an event to login, you can use query to pass your token:
```javascript
broker.createService({
  name: 'io',
  mixins: [SocketIOService],
  settings: {
    namespaces: {
      '/': {
        middlewares: [
          async function(socket, next) {
            if (socket.handshake.query.token) {
              let token = socket.handshake.query.token
              try {
                let user = await this.broker.call("users.resolveToken", {
                  token
                })
								this.logger.info("Authenticated via JWT: ", user.username);
	              // Reduce user fields (it will be transferred to other nodes)
								socket.client.user = _.pick(user, ["_id", "username", "email", "image"]);
              } catch (err) {
                return next(new Error('Authentication error'));
              }
            }
            next()
          }
        ]
      }
    }
  }
})
```

## Joining and leaving rooms

In your action, set ctx.meta.$join or ctx.meta.$leave to the rooms you want to join or leave.

eg.

```javascript
ctx.meta.$join = 'room1' //Join room1
ctx.meta.$join = ['room1', 'room2'] // Join room1 and room2

ctx.meta.$leave = 'room1' //Leave room1
ctx.meta.$leave = ['room1', 'room2'] // Leave room1 and room2
```

After the action finished, `moleculer-io` will join or leave the room you specified.

Example room management service:

```javascript
broker.createService({
  name: 'rooms',
  actions: {
    join(ctx){
      ctx.meta.$join = ctx.params.room
    },
    leave(ctx){
      ctx.meta.$leave = ctx.params.room
    },
    list(ctx){
      return ctx.meta.$rooms
    }
  }
})
```

## Broadcast

If you want to broadcast event to socket.io from moleculer service:

```javascript
broker.call('io.broadcast', {
  namespace:'/', //optional
  event:'hello',
  args: ['my', 'friends','!'], //optional
  volatile: true, //optional
  local: true, //optional
  rooms: ['room1', 'room2'] //optional
})
```

Note: You should change the 'io' to the service name you created.

## Full settings

```javascript
settings:{
  port: 3000,
  io: {}, //socket.io options
  namespaces: {
    '/':{
      middlewares:[],
      packetMiddlewares:[],
      events:{
        'call':{
          whitelist: [],
          callOptions:{},
          before: async function(ctx, socket, args){},
          after:async function(ctx, socket, res){}
        }
      }
    }
  }
}
```

# Change logs

**x.x.x**: Add `initServer` method.

# License

moleculer-gundb is available under the MIT license.