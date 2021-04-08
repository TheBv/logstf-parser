import * as events from '../events';
import { IGameState } from '../Game';
interface Round {
    lengthInSeconds: number;
    redScore: number;
    bluScore: number;
    winner: events.Team | null;
    events: Array<any>;
}
declare class GameStateModule implements events.IStats {
    identifier: string;
    private gameState;
    private rounds;
    private currentRoundEvents;
    private currentRoundStartTime;
    private currentRoundPausedStart;
    private currentRoundPausedTime;
    private totalLengthInSeconds;
    private playerNames;
    constructor(gameState: IGameState);
    private newRound;
    private endRound;
    private getLastRound;
    onKill(event: events.IKillEvent): void;
    onScore(event: events.IRoundScoreEvent): void;
    onRoundStart(event: events.IRoundStartEvent): void;
    onRoundEnd(event: events.IRoundEndEvent): void;
    onGameOver(event: events.IGameOverEvent): void;
    onPause(event: events.IPauseEvent): void;
    onUnpause(event: events.IUnpauseEvent): void;
    onMapLoad(event: events.IMapLoadEvent): void;
    onCapture(event: events.ICaptureEvent): void;
    toJSON(): {
        names: {
            [index: string]: string;
        };
        totalLengthInSeconds: number;
        rounds: Round[];
    };
}
export default GameStateModule;
