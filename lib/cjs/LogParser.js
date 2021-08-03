"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.LogParser = void 0;
const Game_1 = require("./Game");
const GameStateModule_1 = __importDefault(require("./modules/GameStateModule"));
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
exports.events = __importStar(require("./events"));
__exportStar(require("./modules/ModuleHolder"), exports);
//# sourceMappingURL=LogParser.js.map