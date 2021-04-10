//Player versus Class
class PvCModule {
    constructor(gameState) {
        this.defaultStats = () => {
            return {
                kills: 0,
                assists: 0,
                deaths: 0,
                damage: 0,
                damageTaken: 0,
            };
        };
        this.identifier = 'PvC';
        this.gameState = gameState;
        this.players = new Map();
        this.currentRoles = new Map();
    }
    getStats(player, role) {
        if (!this.players.has(player)) {
            this.players.set(player, new Map());
        }
        const playerInstance = this.players.get(player);
        if (!playerInstance.has(role)) {
            playerInstance.set(role, this.defaultStats());
        }
        const returnInstance = playerInstance.get(role);
        return returnInstance;
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attackerRole = this.currentRoles.get(event.attacker.id);
        const victimRole = this.currentRoles.get(event.victim.id);
        if (attackerRole && victimRole) {
            const attacker = this.getStats(event.attacker.id, victimRole);
            const victim = this.getStats(event.victim.id, attackerRole);
            attacker.kills += 1;
            victim.deaths += 1;
        }
    }
    onAssist(event) {
        if (!this.gameState.isLive)
            return;
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attackerRole = this.currentRoles.get(event.attacker.id);
        const victimRole = this.currentRoles.get(event.victim.id);
        if (!attackerRole)
            return;
        const attacker = this.getStats(event.attacker.id, victimRole);
        attacker.damage += event.damage;
        if (victimRole) {
            const victim = this.getStats(event.victim.id, attackerRole);
            victim.damageTaken += event.damage;
        }
    }
    onSpawn(event) {
        this.currentRoles.set(event.player.id, event.role);
    }
    onRole(event) {
        this.currentRoles.set(event.player.id, event.role);
    }
    toJSON() {
        return this.players;
    }
}
export default PvCModule;
//# sourceMappingURL=PvCModule.js.map