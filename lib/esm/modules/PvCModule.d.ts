import * as events from '../events';
import { IGameState } from '../Game';
interface IPvCStats {
    kills: number;
    assists: number;
    deaths: number;
    damage: number;
    damageTaken: number;
}
declare class PvCModule implements events.IStats {
    identifier: string;
    private players;
    private currentRoles;
    private gameState;
    constructor(gameState: IGameState);
    private getStats;
    private defaultStats;
    onKill(event: events.IKillEvent): void;
    onAssist(event: events.IAssistEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onSpawn(event: events.ISpawnEvent): void;
    onRole(event: events.IRoleEvent): void;
    toJSON(): Map<string, Map<events.Role, IPvCStats>>;
}
export default PvCModule;
