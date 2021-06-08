import * as events from '../events';
import { IGameState } from '../Game';
interface IMedicStats {
    advantagesLost: number;
    biggestAdvantageLost: number;
    nearFullChargeDeaths: number;
    deathsAfterUber: number;
    avgTimeBeforeFirstHealing: number;
    avgTimeToBuild: number;
    avgTimeToUse: number;
    avgUberLength: number;
}
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
    drops: number;
    airshots: number;
    sentriesBuilt: number;
    sentriesDestroyed: number;
    headshots: number;
    headshotKills: number;
    healing: number;
    healingReceived: number;
    medkits: number;
    medkitsHp: number;
    backstabs: number;
    capturesPoint: number;
    capturesIntel: number;
    longestKillStreak: number;
    currentKillStreak: number;
    medicstats: IMedicStats | null;
}
declare class PlayerStatsModule implements events.IStats {
    identifier: string;
    private players;
    private internalStats;
    private gameState;
    constructor(gameState: IGameState);
    private defaultPlayer;
    private defaultInternalStats;
    private defaultMedicStats;
    private getMean;
    private getOrCreatePlayer;
    private getOrCreateStats;
    onKill(event: events.IKillEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onCapture(event: events.ICaptureEvent): void;
    onFlag(event: events.IFlagEvent): void;
    onPickup(event: events.IPickupEvent): void;
    onHeal(event: events.IHealEvent): void;
    onFirstHeal(event: events.IFirstHealEvent): void;
    onBuild(event: events.IBuildEvent): void;
    onObjectDestroyed(event: events.IObjectDestroyedEvent): void;
    onAssist(event: events.IAssistEvent): void;
    onSuicide(event: events.ISuicideEvent): void;
    onSpawn(event: events.ISpawnEvent): void;
    onCharge(event: events.IChargeEvent): void;
    onChargeReady(event: events.IChargeReadyEvent): void;
    onLostUberAdv(event: events.ILostUberAdvantageEvent): void;
    onMedicDeath(event: events.IMedicDeathEvent): void;
    onMedicDeathEx(event: events.IMedicDeathExEvent): void;
    onChargeEnded(event: events.IChargeEndedEvent): void;
    finish(): void;
    toJSON(): {
        [id: string]: IPlayerStats;
    };
}
export default PlayerStatsModule;
