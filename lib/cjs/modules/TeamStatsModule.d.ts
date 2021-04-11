import * as events from '../events';
import { IGameState } from '../Game';
interface ITeamStats {
    score: number;
    kills: number;
    deaths: number;
    damage: number;
    charges: number;
    drops: number;
    captures: number;
    midfights: number;
}
declare class TeamStatsModule implements events.IStats {
    identifier: string;
    private players;
    private teams;
    private gameState;
    private isFirstCap;
    constructor(gameState: IGameState);
    private getOrCreatePlayer;
    private defaultTeam;
    private defaultPlayer;
    onKill(event: events.IKillEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onCharge(event: events.IChargeEvent): void;
    onRoundStart(event: events.IRoundStartEvent): void;
    onRoundEnd(event: events.IRoundEndEvent): void;
    onCapture(event: events.ICaptureEvent): void;
    onMedicDeath(event: events.IMedicDeathEvent): void;
    finish(): void;
    toJSON(): {
        [team: string]: ITeamStats;
    };
}
export default TeamStatsModule;
