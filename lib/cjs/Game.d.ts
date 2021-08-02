import * as events from './events';
export interface PlayerInfo {
    id: string;
    name: string;
    team: string;
}
interface IEventDefinition {
    createEvent: IEventCreator | null;
    regexp: RegExp;
}
interface IEventCreator {
    (regexpMatches: any, props: Map<string, string>, time: number): events.IEvent | null;
}
export interface IGameState {
    isLive: boolean;
    mapName: string | null;
}
export declare class Game {
    events: Map<string, IEventDefinition>;
    modules: events.IStats[];
    gameState: IGameState;
    constructor();
    createEvent(eventType: string, regexpMatches: object, props: Map<string, string>, time: number): events.IEvent | null;
    processLine(line: string): void;
    private makeTimestamp;
    finish(): void;
    toJSON(): any;
}
export {};
