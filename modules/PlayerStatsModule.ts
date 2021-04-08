import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'

interface IPlayerStats {
    team: string | null
    kills: number
    assists: number
    deaths: number
    damage: number
    suicides: number
    damageTaken: number
    charges: number
    chargesByType: {[index: string] : number}
    airshots: number
    sentriesBuilt: number
    headshots: number
    headshotKills: number
    healing: number
    healingReceived: number
    backstabs: number
    captures: number
    longestKillStreak: number
    currentKillStreak: number
}


class PlayerStatsModule implements events.IStats {
    public identifier: string
    private players: {[id:string]: IPlayerStats}
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'players'
        this.players = {}
        this.gameState = gameState
    }

    private defaultPlayer = (): IPlayerStats => ({
        team: null,
        kills: 0,
        assists: 0,
        deaths: 0,
        damage: 0,
        suicides: 0,
        damageTaken: 0,
        charges: 0,
        chargesByType: {},
        airshots: 0,
        sentriesBuilt: 0,
        headshots: 0,
        headshotKills: 0,
        healing: 0,
        healingReceived: 0,
        backstabs: 0,
        captures: 0,
        longestKillStreak: 0,
        currentKillStreak: 0,
    })

    private getOrCreatePlayer(player: PlayerInfo): IPlayerStats {
        if (!(player.id in this.players)) {
            this.players[player.id] = this.defaultPlayer()
        }
        let playerInstance = this.players[player.id]
        if (!playerInstance) throw new Error()
        playerInstance.team = player.team
        return playerInstance
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)

        attacker.kills++
        attacker.currentKillStreak++

        if (event.headshot) attacker.headshots++
        if (event.backstab) attacker.backstabs++
        
        victim.deaths++
        victim.longestKillStreak = Math.max(victim.currentKillStreak, victim.longestKillStreak)
        victim.currentKillStreak = 0
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)

        attacker.damage += event.damage
        if (event.headshot) attacker.headshots += 1
        if (event.airshot) attacker.airshots++

        if (event.victim) {
            const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)
            if (victim) {
                victim.damageTaken += event.damage
            }
        }
    }

    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        const healer: IPlayerStats = this.getOrCreatePlayer(event.healer)
        const target: IPlayerStats = this.getOrCreatePlayer(event.target)

        healer.healing += event.healing
        target.healingReceived += event.healing
    }

    onAssist(event: events.IAssistEvent) {
        if (!this.gameState.isLive) return
        const assister: IPlayerStats = this.getOrCreatePlayer(event.assister)
        assister.assists += 1
    }

    onSuicide(event: events.ISuicideEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        player.deaths += 1
        player.suicides += 1
    }

    onCharge(event: events.IChargeEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        player.charges += 1
        if (!(event.medigunType in player.chargesByType)) {
            player.chargesByType[event.medigunType] = 0
        }
        player.chargesByType[event.medigunType] += 1
    }

    toJSON(): {[id:string]: IPlayerStats} {
        return this.players
    }

}

export default PlayerStatsModule