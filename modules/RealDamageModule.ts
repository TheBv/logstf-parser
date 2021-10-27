import * as events from '../events'
import { IGameState } from '../Game'

interface IDamageStats {
    damageTaken: number
    damageDealt: number
}

class RealDamageModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private notableEvents: number[]
    private damageEvents: events.IDamageEvent[]
    private realDamages: { [id: string]: IDamageStats }
    constructor(gameState: IGameState) {
        this.identifier = 'realDamage'
        this.notableEvents = []
        this.gameState = gameState
        this.damageEvents = []
        this.realDamages = {}
    }

    private getOrCreatePlayer(playerid: string): IDamageStats {
        if (!this.realDamages[playerid]) {
            this.realDamages[playerid] = { damageTaken: 0, damageDealt: 0 }
        }
        return this.realDamages[playerid]
    }

    onSpawn(event: events.ISpawnEvent) {
        if (!this.gameState.isLive) return
        this.getOrCreatePlayer(event.player.id)
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        this.damageEvents.push(event)
        const attackerDamage = this.getOrCreatePlayer(event.attacker.id)//{ DamageTaken: 0, DamageDealt: 0 }
        attackerDamage.damageDealt += event.realDamage
        if (event.victim) {
            const victimDamage = this.getOrCreatePlayer(event.victim.id)
            victimDamage.damageTaken += event.realDamage
        }
    }

    toJSON() {
        return this.realDamages
    }

}

export default RealDamageModule