import * as events from '../events'
import { IGameState } from '../Game'


export default class RealDamageModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private notableEvents: number[]
    private damageEvents: events.IDamageEvent[]
    private realDamages: {[id: string]: {DamageDealt: number, DamageTaken: number}}
    constructor(gameState: IGameState) {
        this.identifier = 'realDamage'
        this.notableEvents = []
        this.gameState = gameState
        this.damageEvents = []
        this.realDamages = {}
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        this.notableEvents.push(event.timestamp)
    }

    onCapture(event: events.ICaptureEvent) {
        if (!this.gameState.isLive) return
        this.notableEvents.push(event.timestamp)
    }

    onCharge(event: events.IChargeEvent) {
        if (!this.gameState.isLive) return
        this.notableEvents.push(event.timestamp)
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        this.damageEvents.push(event)
        this.realDamages[event.attacker.id] = {DamageTaken :0, DamageDealt: 0}
        if (event.victim)
            this.realDamages[event.victim.id] = {DamageTaken :0, DamageDealt: 0}
    }

    finish() {
        for (const damage of this.damageEvents) {
            for (const notableTimestamp of this.notableEvents) {
                if (Math.abs(notableTimestamp - damage.timestamp) < 10) {
                    this.realDamages[damage.attacker.id].DamageDealt += damage.damage
                    if (damage.victim)
                        this.realDamages[damage.victim.id].DamageTaken += damage.damage
                    break
                }
            }
        }
    }

    toJSON() {
        return this.realDamages
    }
}