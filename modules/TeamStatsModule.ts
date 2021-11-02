import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'
import { renameObjectKeys } from '../Utilities'
import { Team, Teams } from "../interfaces/LogstfInterfaces"


interface ITeamPlayerStats {
    team: string | null
    kills: number
    deaths: number
    damage: number
    charges: number
    drops: number
}

interface ITeamStats {
    score: number
    kills: number
    deaths: number
    damage: number
    charges: number
    drops: number
    captures: number
    midfights: number
}

class TeamStatsModule implements events.IStats {
    public identifier: string
    private players: Map<string, ITeamPlayerStats>
    private teams: { [team: string]: ITeamStats }
    private gameState: IGameState
    private isFirstCap: boolean

    constructor(gameState: IGameState) {
        this.identifier = 'teams'
        this.players = new Map<string, ITeamPlayerStats>()
        this.teams = {
            Red: this.defaultTeam(),
            Blue: this.defaultTeam(),
        }
        this.gameState = gameState
        this.isFirstCap = true
    }

    private getOrCreatePlayer(player: PlayerInfo): ITeamPlayerStats {
        if (!this.players.has(player.id)) {
            this.players.set(player.id, this.defaultPlayer())
        }
        let playerInstance = this.players.get(player.id)
        if (!playerInstance) throw new Error()
        playerInstance.team = player.team
        return playerInstance
    }

    private defaultTeam = (): ITeamStats => ({
        score: 0,
        kills: 0,
        deaths: 0,
        damage: 0,
        charges: 0,
        drops: 0,
        captures: 0,
        midfights: 0,
    })

    private defaultPlayer = (): ITeamPlayerStats => ({
        team: null,
        kills: 0,
        deaths: 0,
        damage: 0,
        charges: 0,
        drops: 0,
    })

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        const attacker: ITeamPlayerStats = this.getOrCreatePlayer(event.attacker)
        attacker.kills += 1
        const victim: ITeamPlayerStats = this.getOrCreatePlayer(event.victim)
        victim.deaths += 1
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attacker: ITeamPlayerStats = this.getOrCreatePlayer(event.attacker)
        attacker.damage += event.damage
    }

    onCharge(event: events.IChargeEvent) {
        if (!this.gameState.isLive) return
        const player: ITeamPlayerStats = this.getOrCreatePlayer(event.player)
        player.charges += 1
    }

    onRoundStart(event: events.IRoundStartEvent) {
        this.isFirstCap = true
    }

    onScore(event: events.IRoundScoreEvent) {
        if (event.team == events.Team.Red) {
            this.teams.Red.score = event.score
        } else if (event.team == events.Team.Blue) {
            this.teams.Blue.score = event.score
        }
    }

    onCapture(event: events.ICaptureEvent) {
        if (!this.gameState.isLive) return
        this.teams[event.team].captures += 1
        if (this.isFirstCap) this.teams[event.team].midfights += 1
        this.isFirstCap = false
    }

    onMedicDeath(event: events.IMedicDeathEvent) {
        if (!this.gameState.isLive) return
        if (event.isDrop) {
            const victim: ITeamPlayerStats = this.getOrCreatePlayer(event.victim)
            victim.drops += 1
        }
    }

    finish() {
        this.players.forEach((stats, playerId) => {
            if (stats.team !== 'Red' && stats.team !== 'Blue') return
            const teamStats = this.teams[stats.team]
            if (!teamStats) return
            teamStats.kills += stats.kills
            teamStats.deaths += stats.deaths
            teamStats.damage += stats.damage
            teamStats.charges += stats.charges
            teamStats.drops += stats.drops
        })
    }

    toJSON(): { [team: string]: ITeamStats } {
        return this.teams
    }

    toLogstf(): Teams {
        const transformMap = new Map<string, any>([
            ["captures", "caps"],
            ["charges", "charges"],
            ["deaths", "deaths"],
            ["damage", "dmg"],
            ["drops", "drops"],
            ["midfights", "firstcaps"],
            ["kills", "kills"],
            ["score", "score"]
        ])
        const teams: Teams = {
            Blue: <Team>renameObjectKeys(this.teams.Blue, transformMap),
            Red: <Team>renameObjectKeys(this.teams.Red, transformMap)
        }
        return teams
    }
}

export default TeamStatsModule