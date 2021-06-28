"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.LogParser = void 0;
const Game_1 = require("./Game");
const GameStateModule_1 = require("./modules/GameStateModule");
class LogParser {
    constructor() {
        this.modules = [];
        this.useCustom = false;
    }
    useCustomGameState(bool) {
        this.useCustom = true;
    }
    parseLines(lines) {
        const game = new Game_1.Game();
        if (!this.useCustom) {
            game.modules.push(new GameStateModule_1.default(game.gameState));
        }
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
    getModules() {
        return this.modules;
    }
}
exports.LogParser = LogParser;
//Export interfaces 
exports.events = require("./events");
__exportStar(require("./modules/ModuleHolder"), exports);
//# sourceMappingURL=LogParser.js.map