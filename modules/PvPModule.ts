import * as events from '../events'
import { IGameState } from '../Game'


interface IPvPStats {
    kills: number
    assists: number
    damage: number
    airshots: number
    headshots: number
    headshotKills: number
    healing: number
    backstabs: number
}

//Player stats towards other player
class PvPModule implements events.IStats {
    public identifier: string
    private players: Map<string, Map<string, IPvPStats>>
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'PvP'
        this.gameState = gameState
        this.players = new Map<string, Map<string, IPvPStats>>()
    }

    private defaultStats = (): IPvPStats => ({
        kills: 0,
        assists: 0,
        damage: 0,
        airshots: 0,
        headshots: 0,
        headshotKills: 0,
        healing: 0,
        backstabs: 0,
    })

    private getStats(player: string, target: string): IPvPStats {
        if (!this.players.has(player)) {
            this.players.set(player, new Map<string, IPvPStats>())
        }
        const playerInstance = this.players.get(player)!

        if (!playerInstance.has(target)) {
            playerInstance.set(target, this.defaultStats())
        }

        const returnInstance = playerInstance.get(target)!
        return returnInstance
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        const attacker = this.getStats(event.attacker.id, event.victim.id)
        attacker.kills += 1
    }

    onAssist(event: events.IAssistEvent) {
        if (!this.gameState.isLive) return
        const stat = this.getStats(event.assister.id, event.victim.id)
        stat.assists += 1
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attacker = this.getStats(event.attacker.id, event.victim!.id)
        attacker.damage += event.damage
    }
    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        const stat = this.getStats(event.healer.id, event.target.id)
        stat.healing += event.healing
    }

    toJSON(): Map<string, Map<string, IPvPStats>> {
        return this.players
    }

}

export default PvPModule