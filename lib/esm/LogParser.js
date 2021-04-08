import { Game } from './Game';
export class LogParser {
    constructor() {
        this.modules = [];
    }
    parseLines(lines) {
        const game = new Game();
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
//# sourceMappingURL=LogParser.js.map