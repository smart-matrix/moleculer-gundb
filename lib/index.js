"use strict";
const GunDBService = {
    name: "gundb",
    mixins: [],
    settings: {
        port: process.env.PORT || 3000,
    },
    actions: {
        test(ctx) {
            return "Hello there " + (ctx.params.name || "Anonymous");
        }
    },
    methods: {},
    created() {
    },
    started() {
    },
    stopped() {
    }
};
module.exports = GunDBService;
//# sourceMappingURL=index.js.map