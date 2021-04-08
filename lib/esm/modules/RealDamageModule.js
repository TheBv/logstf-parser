export default class RealDamageModule {
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
        this.realDamages[event.attacker.id] = 0;
    }
    finish() {
        for (const damage of this.damageEvents) {
            for (const notableTimestamp of this.notableEvents) {
                if (Math.abs(notableTimestamp - damage.timestamp) < 10) {
                    this.realDamages[damage.attacker.id] += damage.damage;
                    break;
                }
            }
        }
    }
    toJSON() {
        return this.realDamages;
    }
}
//# sourceMappingURL=RealDamageModule.js.map