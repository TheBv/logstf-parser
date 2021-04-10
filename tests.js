const parserCJS = require("./lib/cjs/LogParser");
const fs = require("fs");
const moduleK = require("./lib/cjs/modules/RealDamageModule");

const LogParserCJS = new parserCJS.LogParser();
LogParserCJS.addModule(moduleK.default);
console.log("6s");
let lines = fs.readFileSync("./tests/log_2788889.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
console.log("6s");
lines = fs.readFileSync("./tests/log_2088801.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
console.log("BBall");
lines = fs.readFileSync("./tests/log_bball.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
console.log("HL");
lines = fs.readFileSync("./tests/log_HL.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
console.log("Completed");
