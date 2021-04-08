import * as events from '../events'
import { IGameState } from '../Game'


export default class RealDamageModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private notableEvents: number[]
    private damageEvents: events.IDamageEvent[]
    private realDamages: {[id: string]: number}

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
        this.realDamages[event.attacker.id] = 0
    }

    finish() {
        for (const damage of this.damageEvents) {
            for (const notableTimestamp of this.notableEvents) {
                if (Math.abs(notableTimestamp - damage.timestamp) < 10) {
                    this.realDamages[damage.attacker.id] += damage.damage
                    break
                }
            }
        }
    }

    toJSON() {
        return this.realDamages
    }
}