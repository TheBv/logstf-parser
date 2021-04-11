import * as events from '../events';
import { IGameState } from '../Game';
interface IPlayerStats {
    team: string | null;
    kills: number;
    dmg: number;
}
interface ITeamRoundStats {
    score: number;
    kills: number;
    dmg: number;
    ubers: number;
}
interface Round {
    lengthInSeconds: number;
    firstCap: string;
    winner: events.Team | null;
    team: {
        Blue: ITeamRoundStats;
        Red: ITeamRoundStats;
    };
    events: Array<any>;
    players: {
        [id: string]: IPlayerStats;
    };
}
declare class GameStateModule implements events.IStats {
    identifier: string;
    private gameState;
    private rounds;
    private currentRoundPlayers;
    private currentRoundEvents;
    private currentRoundTeams;
    private currentRoundStartTime;
    private currentRoundPausedStart;
    private currentRoundPausedTime;
    private totalLengthInSeconds;
    private firstCap;
    constructor(gameState: IGameState);
    private defaultTeamStats;
    private defaultPlayer;
    private getOrCreatePlayer;
    private newRound;
    private endRound;
    private getLastRound;
    onKill(event: events.IKillEvent): void;
    onDamage(event: events.IDamageEvent): void;
    onScore(event: events.IRoundScoreEvent): void;
    onRoundStart(event: events.IRoundStartEvent): void;
    onRoundEnd(event: events.IRoundEndEvent): void;
    onGameOver(event: events.IGameOverEvent): void;
    onPause(event: events.IPauseEvent): void;
    onUnpause(event: events.IUnpauseEvent): void;
    onMapLoad(event: events.IMapLoadEvent): void;
    onFlag(event: events.IFlagEvent): void;
    onCapture(event: events.ICaptureEvent): void;
    onCharge(event: events.IChargeEvent): void;
    onMedicDeath(event: events.IMedicDeathEvent): void;
    toJSON(): {
        rounds: Round[];
        toatlLength: number;
    };
}
export default GameStateModule;
