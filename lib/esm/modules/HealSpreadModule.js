class HealSpreadModule {
    constructor(gameState) {
        this.identifier = 'healspread';
        this.gameState = gameState;
        this.healspread = {};
    }
    getOrCreateHealer(player) {
        if (!(player.id in this.healspread)) {
            this.healspread[player.id] = {};
        }
        let playerInstance = this.healspread[player.id];
        if (!playerInstance)
            throw new Error();
        return playerInstance;
    }
    onHeal(event) {
        if (!this.gameState.isLive)
            return;
        const healingTargets = this.getOrCreateHealer(event.healer);
        const healer = this.getOrCreateHealer(event.healer);
        if (!(event.target.id in healer)) {
            healer[event.target.id] = 0;
        }
        healer[event.target.id] += event.healing;
    }
    toJSON() {
        return this.healspread;
    }
}
export default HealSpreadModule;
//# sourceMappingURL=HealSpreadModule.js.map