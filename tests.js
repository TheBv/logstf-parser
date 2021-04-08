const parserCJS = require("./lib/cjs/LogParser");
const fs = require("fs");


const LogParserCJS = new parserCJS.LogParser();
const lines = fs.readFileSync("./tests/log_2788889.log", "UTF-8").split("\n");
console.log(LogParserCJS.parseLines(lines).toJSON());
