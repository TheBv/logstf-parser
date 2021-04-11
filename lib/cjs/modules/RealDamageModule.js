"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RealDamageModule {
    constructor(gameState) {
        this.identifier = 'realDamage';
        this.notableEvents = [];
        this.gameState = gameState;
        this.damageEvents = [];
        this.realDamages = {};
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        this.notableEvents.push(event.timestamp);
    }
    onCapture(event) {
        if (!this.gameState.isLive)
            return;
        this.notableEvents.push(event.timestamp);
    }
    onCharge(event) {
        if (!this.gameState.isLive)
            return;
        this.notableEvents.push(event.timestamp);
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        this.damageEvents.push(event);
        this.realDamages[event.attacker.id] = { DamageTaken: 0, DamageDealt: 0 };
        if (event.victim)
            this.realDamages[event.victim.id] = { DamageTaken: 0, DamageDealt: 0 };
    }
    finish() {
        for (const damage of this.damageEvents) {
            for (const notableTimestamp of this.notableEvents) {
                if (Math.abs(notableTimestamp - damage.timestamp) < 10) {
                    this.realDamages[damage.attacker.id].DamageDealt += damage.damage;
                    if (damage.victim)
                        this.realDamages[damage.victim.id].DamageTaken += damage.damage;
                    break;
                }
            }
        }
    }
    toJSON() {
        return this.realDamages;
    }
}
exports.default = RealDamageModule;
//# sourceMappingURL=RealDamageModule.js.map