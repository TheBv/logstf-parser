import * as events from '../events';
import { IGameState } from '../Game';
interface IPvPStats {
    kills: number;
    assists: number;
    damage: number;
    airshots: number;
    headshots: number;
    headshotKills: number;
    healing: number;
    backstabs: number;
}
declare class PvPModule implements events.IStats {
    identifier: string;
    private players;
    private gameState;
    constructor(gameState: IGameState);
    private defaultStats;
    private getStats;
    onKill(event: events.IKillEvent): void;
    onAssist(event: events.IAssistEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onHeal(event: events.IHealEvent): void;
    toJSON(): Map<string, Map<string, IPvPStats>>;
}
export default PvPModule;
