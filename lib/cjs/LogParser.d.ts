import * as events from './events';
import { Game } from './Game';
export declare class LogParser {
    modules: events.IStats[];
    constructor();
    parseLines(lines: string[]): Game;
    addModule(moduleInstance: events.IStats): void;
}
