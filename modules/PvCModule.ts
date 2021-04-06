import * as events from '../events'
import { IGameState } from '../LogParser'

interface IPvCStats {
    kills: number
    assists: number
    deaths: number
    damage: number
    damageTaken: number
}


class PvCModule implements events.IStats {
    public identifier: string
    private players: Map<string, Map<events.Role, IPvCStats>>
    private currentRoles: Map<string, events.Role>
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'PvC'
        this.gameState = gameState
        this.players = new Map<string, Map<events.Role, IPvCStats>>()
        this.currentRoles = new Map<string, events.Role>()
    }

    private getStats(player: string, role: events.Role): IPvCStats {
        if (!this.players.has(player)) {
            this.players.set(player, new Map<events.Role, IPvCStats>())
        }
        const playerInstance = this.players.get(player)!

        if (!playerInstance.has(role)) {
            playerInstance.set(role, this.defaultStats())
        }

        const returnInstance = playerInstance.get(role)!
        return returnInstance
    }

    private defaultStats = () => {
        return {
            kills: 0,
            assists: 0,
            deaths: 0,
            damage: 0,
            damageTaken: 0,
        }
    }



    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        const attackerRole = this.currentRoles.get(event.attacker.id)
        const victimRole = this.currentRoles.get(event.victim.id)

        if (attackerRole && victimRole) {
            const attacker = this.getStats(event.attacker.id, victimRole)
            const victim = this.getStats(event.victim.id, attackerRole)

            attacker.kills += 1
            victim.deaths += 1
        }
    }

    onAssist(event: events.IAssistEvent) {
        if (!this.gameState.isLive) return

    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attackerRole = this.currentRoles.get(event.attacker.id)
        const victimRole = this.currentRoles.get(event.victim!.id)

        if (!attackerRole) return
        const attacker = this.getStats(event.attacker.id, victimRole!)
        attacker.damage += event.damage

        if (victimRole) {
            const victim = this.getStats(event.victim!.id, attackerRole)
            victim.damageTaken += event.damage
        }
    }

    onSpawn(event: events.ISpawnEvent) {
        this.currentRoles.set(event.player.id, event.role)
    }

    onRole(event: events.IRoleEvent) {
        this.currentRoles.set(event.player.id, event.role)
    }

    toJSON(): Map<string, Map<events.Role, IPvCStats>> {
        return this.players
    }
}

export default PvCModule