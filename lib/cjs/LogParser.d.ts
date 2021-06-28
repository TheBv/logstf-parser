import * as events from './events';
import { Game, IGameState } from './Game';
export declare class LogParser {
    private modules;
    private useCustom;
    constructor();
    useCustomGameState(bool: boolean): void;
    parseLines(lines: string[]): Game;
    addModule(moduleClass: {
        new (gameState: IGameState): events.IStats;
    }): void;
    getModules(): {
        new (gameState: IGameState): events.IStats;
    }[];
}
export * as events from './events';
export { IGameState, PlayerInfo } from './Game';
export * from './modules/ModuleHolder';
