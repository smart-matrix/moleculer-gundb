/*
 * moleculer-gundb
 * Copyright (c) 2018 Michael Gearhardt (https://github.com/mcgear/moleculer-gundb)
 * MIT Licensed
 */

"use strict";

module.exports = {

	name: "gun",

	/**
	 * Default settings
	 */
	settings: {

	},

	/**
	 * Actions
	 */
	actions: {
		test(ctx) {
			return "Hello " + (ctx.params.name || "Anonymous");
		}
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};