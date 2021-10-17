const parserCJS = require("./lib/cjs/LogParser");
const fs = require("fs");
const LogParserCJS = new parserCJS.LogParser();
for (const module of Object.values(parserCJS.defaultModules)){
    LogParserCJS.addModule(module);
}
const dir = fs.readdirSync("./logs");
for (const file of dir) {
    if (file.endsWith(".log")){
        const path = "./logs/" + file;
        const lines = fs.readFileSync(path, "UTF-8").split("\n");
        const game = LogParserCJS.parseLines(lines);
        fs.writeFileSync(path.replace(".log",".json"),JSON.stringify(game.toJSON()));
        console.log("Updated:", file);
    }
}

LogParserCJS.useSteam64Id();
const lines = fs.readFileSync("./logs/log_6s.log", "UTF-8").split("\n");
const game = LogParserCJS.parseLines(lines);
fs.writeFileSync("./logs/log_6s_STEAM64.json",JSON.stringify(game.toJSON()));
console.log("Updated:", "Steam64 log");

console.log("Completed");
