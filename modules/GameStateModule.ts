import * as events from '../events'
import { IGameState } from '../Game'

//TODO bball_log doesn't have winner

interface Round {
    lengthInSeconds: number
    redScore: number
    bluScore: number
    winner: events.Team | null
    events: Array<any>
}

class GameStateModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private rounds: Round[]
    private currentRoundEvents: Array<any>
    private currentRoundStartTime: number
    private currentRoundPausedStart: number
    private currentRoundPausedTime: number
    private totalLengthInSeconds: number
    private playerNames: { [index: string]: string }

    constructor(gameState: IGameState) {
        this.identifier = 'game'
        this.gameState = gameState
        this.currentRoundStartTime = 0
        this.currentRoundPausedStart = 0
        this.currentRoundPausedTime = 0
        this.currentRoundEvents = []
        this.totalLengthInSeconds = 0
        this.rounds = []
        this.playerNames = {}
    }

    private newRound(timestamp: number) {
        this.currentRoundEvents = []
        this.currentRoundStartTime = timestamp
        this.currentRoundPausedTime = 0
        this.currentRoundPausedStart = 0
        this.gameState.isLive = true
    }

    private endRound(timestamp: number, winner: events.Team | null) {
        if (this.gameState.isLive === false) return
        this.gameState.isLive = false
        const roundLength = timestamp - this.currentRoundStartTime - this.currentRoundPausedTime
        if (roundLength < 1) return
        this.rounds.push({
            lengthInSeconds: roundLength,
            redScore: 0,
            bluScore: 0,
            winner: winner,
            events: this.currentRoundEvents,
        })
        this.totalLengthInSeconds += roundLength
    }

    private getLastRound(): Round {
        return this.rounds[this.rounds.length - 1]
    }

    onKill(event: events.IKillEvent) {
        this.playerNames[event.attacker.id] = event.attacker.name
        this.playerNames[event.victim.id] = event.victim.name
    }

    onScore(event: events.IRoundScoreEvent) {
        const lastRound = this.getLastRound()
        if (!lastRound) return
        if (event.team == 'Red') {
            lastRound.redScore = event.score
        } else if (event.team == 'Blue') {
            lastRound.bluScore = event.score
        }
    }

    onRoundStart(event: events.IRoundStartEvent) {
        this.newRound(event.timestamp)
    }

    onRoundEnd(event: events.IRoundEndEvent) {
        this.endRound(event.timestamp, event.winner)
    }

    onGameOver(event: events.IGameOverEvent) {
        this.endRound(event.timestamp, null)
    }

    onPause(event: events.IPauseEvent) {
        this.gameState.isLive = false
        this.currentRoundPausedStart = event.timestamp
    }

    onUnpause(event: events.IUnpauseEvent) {
        this.gameState.isLive = true
        if (this.currentRoundPausedStart > 0 && event.timestamp > this.currentRoundPausedStart) {
            this.currentRoundPausedTime += event.timestamp - this.currentRoundPausedStart
            this.currentRoundPausedStart = 0
        }
    }

    onMapLoad(event: events.IMapLoadEvent) {
        this.gameState.mapName = event.mapName
    }

    onCapture(event: events.ICaptureEvent) {
        const time = event.timestamp - this.currentRoundStartTime
        this.currentRoundEvents.push({
            type: 'capture',
            timeInSeconds: time,
            team: event.team,
            pointId: event.pointId,
            playerIds: event.players.map(player => player.id)
        })
    }

    toJSON() {
        return {
            names: this.playerNames,
            totalLengthInSeconds: this.totalLengthInSeconds,
            rounds: this.rounds
        }
    }
}

export default GameStateModule