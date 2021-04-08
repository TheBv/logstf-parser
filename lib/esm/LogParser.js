import { Game } from './Game';
export class LogParser {
    constructor() {
        this.modules = [];
    }
    parseLines(lines) {
        const game = new Game();
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
//# sourceMappingURL=LogParser.js.map