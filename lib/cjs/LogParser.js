"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.LogParser = void 0;
const Game_1 = require("./Game");
class LogParser {
    constructor() {
        this.modules = [];
    }
    parseLines(lines) {
        const game = new Game_1.Game();
        for (const module of this.modules) {
            game.modules.push(new module(game.gameState));
        }
        lines.forEach(line => game.processLine(line));
        game.finish();
        return game;
    }
    addModule(moduleClass) {
        this.modules.push(moduleClass);
    }
}
exports.LogParser = LogParser;
//Export interfaces 
exports.events = require("./events");
//# sourceMappingURL=LogParser.js.map