import * as events from '../events';
import { IGameState } from '../Game';
interface IPlayerStats {
    team: string | null;
    kills: number;
    assists: number;
    deaths: number;
    damage: number;
    suicides: number;
    damageTaken: number;
    charges: number;
    chargesByType: {
        [index: string]: number;
    };
    airshots: number;
    sentriesBuilt: number;
    headshots: number;
    headshotKills: number;
    healing: number;
    healingReceived: number;
    backstabs: number;
    captures: number;
    longestKillStreak: number;
    currentKillStreak: number;
}
declare class PlayerStatsModule implements events.IStats {
    identifier: string;
    private players;
    private gameState;
    constructor(gameState: IGameState);
    private defaultPlayer;
    private getOrCreatePlayer;
    onKill(event: events.IKillEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onHeal(event: events.IHealEvent): void;
    onAssist(event: events.IAssistEvent): void;
    onSuicide(event: events.ISuicideEvent): void;
    onCharge(event: events.IChargeEvent): void;
    toJSON(): {
        [id: string]: IPlayerStats;
    };
}
export default PlayerStatsModule;
