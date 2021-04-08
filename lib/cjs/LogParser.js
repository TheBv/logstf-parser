"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogParser = void 0;
const Game_1 = require("./Game");
class LogParser {
    constructor() {
        this.modules = [];
    }
    parseLines(lines) {
        const game = new Game_1.Game();
        for (const module of this.modules) {
            game.modules.push(module);
        }
        lines.forEach(line => game.processLine(line));
        game.finish();
        return game;
    }
    addModule(moduleInstance) {
        this.modules.push(moduleInstance);
    }
}
exports.LogParser = LogParser;
//# sourceMappingURL=LogParser.js.map