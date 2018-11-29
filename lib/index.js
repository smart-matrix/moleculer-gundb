/*
 * moleculer-gundb
 * Copyright (c) 2018 Michael Gearhardt (https://github.com/mcgear/moleculer-gundb)
 * MIT Licensed
 */

"use strict";
var Gun = require('gun/gun');

var debug = require('debug')('gun');

module.exports = {
	name: "gun",

	/**
	 * Default settings
	 */
	settings:{
		// port: 3000,
		// gun: {}, //GunDB options
		namespaces: {
		  '/':{
				// middlewares:[],
				// packetMiddlewares:[],
				events:{
					'call':{
					// whitelist: [],
					// callOptions:{},
					// before: async function(ctx, socket, args){
					//   debug('before hook:', args)
					// },
					// after:async function(ctx, socket, res){
					//   debug('after hook', res)
					// }
					}
				}
		  }
		}
	},

	actions: {
    call: {
      visibility: "private",
      async handler(ctx){
        let {socket, action, params, opts, handlerItem} = ctx.params
        if (!_.isString(action)){
					debug(`BadRequest:action is not string! action:`,action);
					
          throw new BadRequestError();
				}
				
        if (handlerItem.whitelist && !this.checkWhitelist(action, handlerItem.whitelist)) {
					debug(`Service "${action}" not found`);
					
          throw new ServiceNotFoundError({action});
				}
				
				const endpoint = this.broker.findNextActionEndpoint(action)
				
        if (endpoint instanceof Error)
					throw endpoint;
					
        if (endpoint.action.visibility != null && endpoint.action.visibility != "published") {
					throw new ServiceNotFoundError({ action });
				}

        let meta = this.getMeta(socket);
				
				opts = _.assign({meta},opts);
				
				debug('Call action:', action, params, opts);
				
				// const vName = this.version ? `v${this.version}.${this.name}` : this.name
				
				// const ctx = Context.create(this.broker, {name: vName + ".call"}, this.broker.nodeID, params, opts || {})
				
        let args = { action, params, callOptions:opts };
				
				if (handlerItem.before) {
          await handlerItem.before.call(this, ctx, socket, args);
				}
				
				let res = await ctx.call(args.action, args.params, args.callOptions);
				
        if (handlerItem.after) {
					await handlerItem.after.call(this, ctx, socket, res);
				}
				
				this.saveUser(socket, ctx);
				
        return res;
      }
    },
  },

	/**
	 * Methods
	 */
	methods: {
		initServer(srv, opts){
      if (srv && 'object' == typeof srv && srv instanceof Object && !srv.listen) {
				opts = srv;
				
        srv = null;
			}
			
			opts = opts || this.settings.gun;
			
			srv = srv || this.server || this.settings.port;
			
			if (srv && srv.listen) {
				this.Gun = new Gun({web: srv });
			
				this.logger.info('GunDB API Gateway started.');
			}
		},
		
    checkWhitelist(action, whitelist) {
			return whitelist.find(mask => {
				if (_.isString(mask)) {
					return match(action, mask);
				} else if (_.isRegExp(mask)) {
					return mask.test(action);
				}
			}) != null
		},

    makeGunHandler:function(handlerItem){
			let whitelist = handlerItem.whitelist;
			
			let opts = handlerItem.callOptions;
			
			const svc = this;
			
			debug('makeGunHandler', handlerItem);
			
      return async function(action, params, respond){
				svc.logger.info(`   => Client '${this.id}' call '${action}' action`);
				
        if (svc.settings.logRequestParams && svc.settings.logRequestParams in svc.logger)
						svc.logger[svc.settings.logRequestParams]("   Params:", params);

        if(_.isFunction(params)){
					respond = params;
					
          params = null;
				}
				
        try{
					let res = await svc.actions.call({socket:this, action, params, opts, handlerItem});
					
					svc.logger.info(`   <= ${chalk.green.bold('Success')} ${action}`);
					
					if(_.isFunction(respond)) 
						respond(null, res);
        }catch(err){
          if (svc.settings.log4XXResponses || (err && !_.inRange(err.code, 400, 500))) {
						svc.logger.error("   Request error!", err.name, ":", err.message, "\n", err.stack, "\nData:", err.data);
					}

					if(_.isFunction(respond)) 
						svc.onError(err, respond);
        }
      }
    },
    getMeta(socket){
      let meta = {
        user: socket.client.user,
        $rooms: Object.keys(socket.rooms)
      }
      debug('getMeta', meta)
      return meta
		},
		
    saveUser(socket,ctx){
      socket.client.user = ctx.meta.user
		},
		
    onError(err, respond){
			debug('onIOError',err);
			
			const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
			
      return respond(errObj);
    },
	},
	
	created(){
		this.handlers = {};
		
		let namespaces = this.settings.namespaces;
		
    for(let nsp in namespaces){
			let item = namespaces[nsp];
			
			debug('Add route:', item);
			
			if(!this.handlers[nsp]) 
				this.handlers[nsp] = {};
			
			let events = item.events;
			
      for(let event in events){
				let handlerItem = events[event];
				
        if (typeof handlerItem === 'function') {
					this.handlers[nsp][event] = handlerItem.bind(this);
					
          return;
				}
				
        this.handlers[nsp][event] = this.makeGunHandler(handlerItem);
      }
    }
	},
	
  started(){
    if (!this.gun)
			this.initServer();

		let namespaces = this.settings.namespaces;
		
    for (let nsp in namespaces) {
			let item = namespaces[nsp];
			
			// let namespace = this.gun.of(nsp);
			
      // if (item.middlewares) {
      //   for (let middleware of item.middlewares) {
      //     namespace.use(middleware.bind(this))
      //   }
			// }
			
			// let handlers = this.handlers[nsp];
			
      // namespace.on('connection', socket=>{
			// 	this.logger.info(`(nsp:'${nsp}') Client connected:`,socket.id);
				
      //   if (item.packetMiddlewares) {
      //     for (let middleware of item.packetMiddlewares) {
      //       socket.use(middleware.bind(this));
      //     }
			// 	}
				
      //   for (let eventName in handlers) {
			// 		debug('Attach event:', eventName);
					
      //     socket.on(eventName, handlers[eventName]);
      //   }
      // });
    }
	},
	
  stopped(){
    if(this.gun){
      return new Promise((resolve, reject)=>{
				this.gun.close();
				
				this.logger.info("GunDB API Gateway stopped!")
				
				resolve();
      })
    }
  },
};