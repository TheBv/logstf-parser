//Player stats towards other player
class PvPModule {
    constructor(gameState) {
        this.defaultStats = () => ({
            kills: 0,
            assists: 0,
            damage: 0,
            airshots: 0,
            headshots: 0,
            headshotKills: 0,
            healing: 0,
            backstabs: 0,
        });
        this.identifier = 'PvP';
        this.gameState = gameState;
        this.players = new Map();
    }
    getStats(player, target) {
        if (!this.players.has(player)) {
            this.players.set(player, new Map());
        }
        const playerInstance = this.players.get(player);
        if (!playerInstance.has(target)) {
            playerInstance.set(target, this.defaultStats());
        }
        const returnInstance = playerInstance.get(target);
        return returnInstance;
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getStats(event.attacker.id, event.victim.id);
        attacker.kills += 1;
    }
    onAssist(event) {
        if (!this.gameState.isLive)
            return;
        const stat = this.getStats(event.assister.id, event.victim.id);
        stat.assists += 1;
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getStats(event.attacker.id, event.victim.id);
        attacker.damage += event.damage;
    }
    onHeal(event) {
        if (!this.gameState.isLive)
            return;
        const stat = this.getStats(event.healer.id, event.target.id);
        stat.healing += event.healing;
    }
    toJSON() {
        return this.players;
    }
}
export default PvPModule;
//# sourceMappingURL=PvPModule.js.map