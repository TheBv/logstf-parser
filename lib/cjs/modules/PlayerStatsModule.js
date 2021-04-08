"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlayerStatsModule {
    constructor(gameState) {
        this.defaultPlayer = () => ({
            team: null,
            kills: 0,
            assists: 0,
            deaths: 0,
            damage: 0,
            suicides: 0,
            damageTaken: 0,
            charges: 0,
            chargesByType: {},
            airshots: 0,
            sentriesBuilt: 0,
            headshots: 0,
            headshotKills: 0,
            healing: 0,
            healingReceived: 0,
            backstabs: 0,
            captures: 0,
            longestKillStreak: 0,
            currentKillStreak: 0,
        });
        this.identifier = 'players';
        this.players = {};
        this.gameState = gameState;
    }
    getOrCreatePlayer(player) {
        if (!(player.id in this.players)) {
            this.players[player.id] = this.defaultPlayer();
        }
        let playerInstance = this.players[player.id];
        if (!playerInstance)
            throw new Error();
        playerInstance.team = player.team;
        return playerInstance;
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        const victim = this.getOrCreatePlayer(event.victim);
        attacker.kills++;
        attacker.currentKillStreak++;
        if (event.headshot)
            attacker.headshots++;
        if (event.backstab)
            attacker.backstabs++;
        victim.deaths++;
        victim.longestKillStreak = Math.max(victim.currentKillStreak, victim.longestKillStreak);
        victim.currentKillStreak = 0;
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        attacker.damage += event.damage;
        if (event.headshot)
            attacker.headshots += 1;
        if (event.airshot)
            attacker.airshots++;
        if (event.victim) {
            const victim = this.getOrCreatePlayer(event.victim);
            if (victim) {
                victim.damageTaken += event.damage;
            }
        }
    }
    onHeal(event) {
        if (!this.gameState.isLive)
            return;
        const healer = this.getOrCreatePlayer(event.healer);
        const target = this.getOrCreatePlayer(event.target);
        healer.healing += event.healing;
        target.healingReceived += event.healing;
    }
    onAssist(event) {
        if (!this.gameState.isLive)
            return;
        const assister = this.getOrCreatePlayer(event.assister);
        assister.assists += 1;
    }
    onSuicide(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        player.deaths += 1;
        player.suicides += 1;
    }
    onCharge(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        player.charges += 1;
        if (!(event.medigunType in player.chargesByType)) {
            player.chargesByType[event.medigunType] = 0;
        }
        player.chargesByType[event.medigunType] += 1;
    }
    toJSON() {
        return this.players;
    }
}
exports.default = PlayerStatsModule;
//# sourceMappingURL=PlayerStatsModule.js.map