import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'

interface IPlayerStats{
    team: string | null
    kills: number
    dmg: number
}

interface ITeamRoundStats{
    score: number
    kills: number
    dmg: number
    ubers: number
}

interface Round {
    lengthInSeconds: number
    startTime: number,
    firstCap: string
    winner: events.Team | null
    team: {Blue: ITeamRoundStats, Red: ITeamRoundStats}
    events: Array<any>
    players: {[id:string]: IPlayerStats}
}

class GameStateModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private gameStartTime: number
    private rounds: Round[]
    private currentRoundPlayers: {[id:string]: IPlayerStats}
    private currentRoundEvents: Array<any>
    private currentRoundTeams: {Blue: ITeamRoundStats, Red: ITeamRoundStats}
    private currentRoundStartTime: number
    private currentRoundPausedStart: number
    private currentRoundPausedTime: number
    private totalLengthInSeconds: number
    private firstCap : string
    private paused : boolean

    constructor(gameState: IGameState) {
        this.identifier = 'game'
        this.gameState = gameState
        this.gameStartTime = 0
        this.currentRoundStartTime = 0
        this.currentRoundPausedStart = 0
        this.currentRoundPausedTime = 0
        this.currentRoundEvents = []
        this.currentRoundTeams = {Blue: this.defaultTeamStats(0), Red: this.defaultTeamStats(0)}
        this.currentRoundPlayers = {}
        this.firstCap = ""
        this.totalLengthInSeconds = 0
        this.rounds = []
        this.paused = false
    }

    private defaultTeamStats = (score: number): ITeamRoundStats => ({
        score: score,
        kills: 0,
        dmg: 0,
        ubers: 0
    })

    private defaultPlayer = (): IPlayerStats => ({
        team: null,
        kills: 0,
        dmg: 0,
    })

    private getOrCreatePlayer(player: PlayerInfo): IPlayerStats {
        if (!(player.id in this.currentRoundPlayers)) {
            this.currentRoundPlayers[player.id] = this.defaultPlayer()
        }
        let playerInstance = this.currentRoundPlayers[player.id]
        if (!playerInstance) throw new Error()
        playerInstance.team = player.team
        return playerInstance
    }

    private newRound(timestamp: number) {
        if (this.rounds.length == 0) {
            this.gameStartTime = timestamp
        }
        this.currentRoundEvents = []
        this.currentRoundStartTime = timestamp
        this.currentRoundPausedTime = 0
        this.currentRoundPausedStart = 0
        this.gameState.isLive = true
        this.currentRoundTeams = {Blue: this.defaultTeamStats(this.currentRoundTeams.Blue.score), Red:this.defaultTeamStats(this.currentRoundTeams.Red.score)}
        this.firstCap = ""
        this.currentRoundPlayers = {}
    }

    private endRound(timestamp: number, winner: events.Team | null) {
        if (this.gameState.isLive === false) return
        this.gameState.isLive = false
        const roundLength = timestamp - this.currentRoundStartTime - this.currentRoundPausedTime
        if (roundLength < 1) return
        if (winner) {
            this.currentRoundEvents.push({
                type: "round_win",
                absoluteTimeInSeconds: timestamp - this.gameStartTime - this.currentRoundPausedTime,
                relativeTimeInSeconds: roundLength,
                team: winner
            })
        }
        this.rounds.push({
            lengthInSeconds: roundLength,
            startTime: timestamp - roundLength,
            firstCap: this.firstCap,
            winner: winner,
            events: this.currentRoundEvents,
            players: this.currentRoundPlayers,
            team: this.currentRoundTeams
        })
        this.totalLengthInSeconds += roundLength
    }

    private getLastRound(): Round {
        return this.rounds[this.rounds.length - 1]
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        attacker.kills += 1
        if (attacker.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.kills += 1
        }
        if (attacker.team == events.Team.Red) {
            this.currentRoundTeams.Red.kills += 1
        }
        // Workaround for the event that the medic dies from 'world' which is being logged as 
        // triggering the medic_death event with them as the attacker as well as victim
        this.currentRoundEvents.filter((round) => {
            return round.absoluteTimeInSeconds == event.timestamp - this.gameStartTime &&
                round.type == 'medic_death' &&
                round.steamid == event.victim.id
        }).forEach((round) => {
            round.attacker = event.attacker.id
        })
    }
    onDamage(event: events.IDamageEvent){
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        attacker.dmg += event.damage
        if (attacker.team == events.Team.Blue){
            this.currentRoundTeams.Blue.dmg += event.damage
        }
        if (attacker.team == events.Team.Red){
            this.currentRoundTeams.Red.dmg += event.damage
        }
    }

    onSpawn(event: events.ISpawnEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.player)
    }

    onScore(event: events.IRoundScoreEvent) {
        const lastRound = this.getLastRound()
        if (!lastRound) return
        if (event.team == events.Team.Red) {
            this.currentRoundTeams.Red.score = event.score
        } else if (event.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.score = event.score
        }
    }

    onRoundStart(event: events.IRoundStartEvent) {
        this.newRound(event.timestamp)
    }

    onMiniRoundStart(event: events.IRoundStartEvent) {
        this.newRound(event.timestamp)
    }

    onRoundEnd(event: events.IRoundEndEvent) {
        this.endRound(event.timestamp, event.winner)
        // Workaround for the case that the "Game_Over" event triggers before the "Round_Win" event
        if (!this.gameState.isLive){
            const roundLength = event.timestamp - this.currentRoundStartTime - this.currentRoundPausedTime
            const lastRound = this.getLastRound()
            // Check to make sure the round_win event happened at the same time as
            // the previous event that ended the round
            if (lastRound.winner) return
            if (lastRound.lengthInSeconds !== roundLength) return
            lastRound.events.push({
                type: "round_win",
                absoluteTimeInSeconds: event.timestamp - this.gameStartTime - this.currentRoundPausedTime,
                relativeTimeInSeconds: roundLength,
                team: event.winner
            })
            lastRound.winner = event.winner
        }
    }

    onGameOver(event: events.IGameOverEvent) {
        this.endRound(event.timestamp, null)
    }

    onPause(event: events.IPauseEvent) {
        this.gameState.isLive = false
        this.paused = true
        this.currentRoundPausedStart = event.timestamp
    }

    onUnpause(event: events.IUnpauseEvent) {
        this.gameState.isLive = true
        this.paused = false
        if (this.currentRoundPausedStart > 0 && event.timestamp > this.currentRoundPausedStart) {
            this.currentRoundPausedTime += event.timestamp - this.currentRoundPausedStart
            this.currentRoundPausedStart = 0
        }
    }
    // Added to fix pause/unpause desync issues 
    onTriggered(event: events.ITriggeredEvent) {
        if (this.gameState.isLive) return
        if (!this.paused) return
        this.onUnpause({
            timestamp : event.timestamp
        })
    }

    onMapLoad(event: events.IMapLoadEvent) {
        this.gameState.mapName = event.mapName
    }

    onFlag(event: events.IFlagEvent){
        if (!this.gameState.isLive) return
        const time = event.timestamp - this.currentRoundStartTime
        this.currentRoundEvents.push({
            type: event.type,
            relativeTimeInSeconds: time,
            absoluteTimeInSeconds: event.timestamp - this.gameStartTime,
            steamid: event.player.id,
            team: event.player.team
        })
    }

    onCapture(event: events.ICaptureEvent) {
        if (!this.gameState.isLive) return
        const time = event.timestamp - this.currentRoundStartTime
        if (this.currentRoundEvents.filter(evt => evt.type == 'pointcap').length == 0) {
            this.firstCap = event.team
        }
        this.currentRoundEvents.push({
            type: 'pointcap',
            relativeTimeInSeconds: time,
            absoluteTimeInSeconds: event.timestamp - this.gameStartTime,
            team: event.team,
            pointId: event.pointId,
            playerIds: event.players.map(player => player.id)
        })
    }

    onCharge(event: events.IChargeEvent){
        if (!this.gameState.isLive) return
        const time = event.timestamp - this.currentRoundStartTime
        const attacker = this.getOrCreatePlayer(event.player);
        if (attacker.team == events.Team.Blue){
            this.currentRoundTeams.Blue.ubers +=1
        }
        if (attacker.team == events.Team.Red){
            this.currentRoundTeams.Red.ubers +=1
        }
        this.currentRoundEvents.push({
            type: 'charge',
            relativeTimeInSeconds: time,
            absoluteTimeInSeconds: event.timestamp - this.gameStartTime,
            medigun: event.medigunType,
            team: event.player.team,
            steamid: event.player.id,
        })
    }
    
    onMedicDeath(event: events.IMedicDeathEvent) {
        if (!this.gameState.isLive) return
        const time = event.timestamp - this.currentRoundStartTime
        if (event.isDrop){
            this.currentRoundEvents.push({
                type: 'drop',
                relativeTimeInSeconds: time,
                absoluteTimeInSeconds: event.timestamp - this.gameStartTime,
                team: event.victim.team,
                steamid: event.victim.id,
            })
        }
        this.currentRoundEvents.push({
            type: 'medic_death',
            relativeTimeInSeconds: time,
            absoluteTimeInSeconds: event.timestamp - this.gameStartTime,
            team: event.victim.team,
            steamid: event.victim.id,
            attacker: event.attacker.id
        })

    }

    toJSON() {
        return {
            rounds: this.rounds,
            totalLength: this.totalLengthInSeconds
        }
    }
}

export default GameStateModule