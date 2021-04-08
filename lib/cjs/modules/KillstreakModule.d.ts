import * as events from '../events';
import { IGameState } from '../Game';
interface IKillstreak {
    steamid: string;
    streak: number;
    time: number;
}
declare class KillstreakModule implements events.IStats {
    identifier: string;
    private kills;
    private gameState;
    private killstreaks;
    private gameStartTime;
    constructor(gameState: IGameState);
    onRoundStart(event: events.IRoundStartEvent): void;
    onKill(event: events.IKillEvent): void;
    finish(): void;
    toJSON(): IKillstreak[];
}
export default KillstreakModule;
