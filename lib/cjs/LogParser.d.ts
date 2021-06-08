import * as events from './events';
import { Game, IGameState } from './Game';
export declare class LogParser {
    private modules;
    constructor();
    parseLines(lines: string[]): Game;
    addModule(moduleClass: {
        new (gameState: IGameState): events.IStats;
    }): void;
}
export * as events from './events';
