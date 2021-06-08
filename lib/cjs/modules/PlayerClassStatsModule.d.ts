import * as events from '../events';
import { IGameState } from '../Game';
interface IClassStats {
    playtimeInSeconds: number;
    kills: number;
    assists: number;
    deaths: number;
    damage: number;
    weapons: Map<string, IWeaponStats>;
}
interface IWeaponStats {
    kills: number;
    damage: number;
    avgDamage: number;
    avgDamages: number[];
    shots: number;
    hits: number;
    healing: number;
}
declare class PlayerClassStatsModule implements events.IStats {
    identifier: string;
    private players;
    private gameState;
    private currentRoles;
    private currentSpawntimes;
    constructor(gameState: IGameState);
    private defaultClassStats;
    private defaultWeaponStats;
    private getClassStats;
    private getWeaponStats;
    private getMean;
    private trackingStop;
    onKill(event: events.IKillEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onHeal(event: events.IHealEvent): void;
    onShot(event: events.IShotEvent): void;
    onShotHit(event: events.IShotEvent): void;
    onSpawn(event: events.ISpawnEvent): void;
    onRole(event: events.IRoleEvent): void;
    onRoundEnd(event: events.IRoundEndEvent): void;
    onDisconnect(event: events.IDisconnectEvent): void;
    onJoinTeam(event: events.IJoinTeamEvent): void;
    finish(): void;
    toJSON(): Map<string, Map<string, IClassStats>>;
}
export default PlayerClassStatsModule;
