const parserCJS = require("./lib/cjs/LogParser");
const fs = require("fs");
const moduleK = require("./lib/cjs/modules/RealDamageModule");

const LogParserCJS = new parserCJS.LogParser();
LogParserCJS.addModule(moduleK.default);
const lines = fs.readFileSync("./tests/log_2788889.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
console.log("Completed")