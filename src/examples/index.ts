const moduleName = process.argv[2] || "simple-ws";

process.argv.splice(2, 1);

require("./" + moduleName);