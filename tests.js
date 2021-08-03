const parserCJS = require("./lib/cjs/LogParser");
const fs = require("fs");
const LogParserCJS = new parserCJS.LogParser();
for (const module of Object.values(parserCJS.defaultModules)){
    LogParserCJS.addModule(module);
}
console.log("6s");
let lines = fs.readFileSync("./tests/LOGS/log_2788889.log", "UTF-8").split("\n");
let game = LogParserCJS.parseLines(lines);
console.log(game.toJSON());
fs.writeFileSync('./tests/LOGS/log_2788889.json',JSON.stringify(game.toJSON()))

console.log("UGH HL KOTH");
lines = fs.readFileSync("./tests/LOGS/log_2088801.log", "UTF-8").split("\n");
game = LogParserCJS.parseLines(lines);
console.log(game.toJSON());
fs.writeFileSync('./tests/LOGS/log_2088801.json',JSON.stringify(game.toJSON()))


console.log("BBall");
lines = fs.readFileSync("./tests/LOGS/log_bball.log", "UTF-8").split("\n");
game = LogParserCJS.parseLines(lines);
console.log(game.toJSON());
fs.writeFileSync('./tests/LOGS/log_bball.json', JSON.stringify(game.toJSON()))

console.log("HL");
lines = fs.readFileSync("./tests/LOGS/log_HL.log", "UTF-8").split("\n");
game = LogParserCJS.parseLines(lines);
console.log(game.toJSON());
fs.writeFileSync('./tests/LOGS/log_HL.json',JSON.stringify(game.toJSON()))

console.log("6s");
lines = fs.readFileSync("./tests/LOGS/log_2892242.log", "UTF-8").split("\n");
game = LogParserCJS.parseLines(lines);
console.log(game.toJSON());
fs.writeFileSync('./tests/LOGS/log_2892242.json',JSON.stringify(game.toJSON()))
console.log("Completed");
