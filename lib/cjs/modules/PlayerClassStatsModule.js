"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlayerClassStatsModule {
    constructor(gameState) {
        this.defaultClassStats = () => ({
            playtimeInSeconds: 0,
            kills: 0,
            assists: 0,
            deaths: 0,
            damage: 0,
            weapons: new Map(),
        });
        this.defaultWeaponStats = () => ({
            kills: 0,
            damage: 0,
            avgDamage: 0,
            avgDamages: [],
            shots: 0,
            hits: 0,
            healing: 0,
        });
        this.identifier = 'playerClasses';
        this.players = new Map();
        this.gameState = gameState;
        this.currentRoles = new Map();
        this.currentSpawntimes = new Map();
    }
    getClassStats(player, role) {
        if (!this.players.has(player)) {
            this.players.set(player, new Map());
        }
        const playerInstance = this.players.get(player);
        if (!playerInstance.has(role)) {
            playerInstance.set(role, this.defaultClassStats());
        }
        const returnInstance = playerInstance.get(role);
        return returnInstance;
    }
    getWeaponStats(weaponMap, weapon) {
        if (!weaponMap.has(weapon)) {
            weaponMap.set(weapon, this.defaultWeaponStats());
        }
        return weaponMap.get(weapon);
    }
    getMean(input) {
        if (input.length != 0)
            return input.reduce((a, b) => a + b) / input.length;
        return 0;
    }
    trackingStop(playerId, timestamp) {
        const currentRole = this.currentRoles.get(playerId);
        const currentSpawntime = this.currentSpawntimes.get(playerId);
        if (currentRole && currentSpawntime) {
            const oldRole = this.getClassStats(playerId, currentRole);
            oldRole.playtimeInSeconds += timestamp - currentSpawntime;
            this.currentSpawntimes.delete(playerId);
        }
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attackerRole = this.currentRoles.get(event.attacker.id);
        if (attackerRole) {
            const attackerStats = this.getClassStats(event.attacker.id, attackerRole);
            attackerStats.kills += 1;
            const weaponStats = this.getWeaponStats(attackerStats.weapons, event.weapon);
            weaponStats.kills += 1;
        }
        const victimRole = this.currentRoles.get(event.victim.id);
        if (victimRole) {
            const victimStats = this.getClassStats(event.victim.id, victimRole);
            victimStats.deaths += 1;
        }
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attackerRole = this.currentRoles.get(event.attacker.id);
        if (!attackerRole)
            return;
        const attackerStats = this.getClassStats(event.attacker.id, attackerRole);
        attackerStats.damage += event.damage;
        const weaponStats = this.getWeaponStats(attackerStats.weapons, event.weapon);
        weaponStats.damage += event.damage;
        weaponStats.avgDamages.push(event.damage);
    }
    onHeal(event) {
        if (!this.gameState.isLive)
            return;
        // TODO
    }
    onShot(event) {
        if (!this.gameState.isLive)
            return;
        const playerRole = this.currentRoles.get(event.player.id);
        if (playerRole) {
            const playerStats = this.getClassStats(event.player.id, playerRole);
            const weaponStats = this.getWeaponStats(playerStats.weapons, event.weapon);
            weaponStats.shots += 1;
        }
    }
    onShotHit(event) {
        if (!this.gameState.isLive)
            return;
        const playerRole = this.currentRoles.get(event.player.id);
        if (playerRole) {
            const playerStats = this.getClassStats(event.player.id, playerRole);
            const weaponStats = this.getWeaponStats(playerStats.weapons, event.weapon);
            weaponStats.hits += 1;
        }
    }
    onSpawn(event) {
        if (!this.gameState.isLive)
            return;
        this.trackingStop(event.player.id, event.timestamp);
        this.currentRoles.set(event.player.id, event.role);
        this.currentSpawntimes.set(event.player.id, event.timestamp);
    }
    onRole(event) {
        if (!this.gameState.isLive)
            return;
        this.trackingStop(event.player.id, event.timestamp);
        this.currentRoles.set(event.player.id, event.role);
        this.currentSpawntimes.set(event.player.id, event.timestamp);
    }
    onRoundEnd(event) {
        for (let playerId of this.currentRoles.keys()) {
            this.trackingStop(playerId, event.timestamp);
        }
    }
    onDisconnect(event) {
        this.trackingStop(event.player.id, event.timestamp);
    }
    onJoinTeam(event) {
        if (event.newTeam === 'Spectator') {
            this.trackingStop(event.player.id, event.timestamp);
        }
    }
    finish() {
        const self = this;
        this.players.forEach(function (playerStats, key) {
            playerStats.forEach(function (classStarts, key) {
                classStarts.weapons.forEach(function (weaponStats, key) {
                    weaponStats.avgDamage = self.getMean(weaponStats.avgDamages);
                });
            });
        });
    }
    toJSON() {
        return this.players;
    }
}
exports.default = PlayerClassStatsModule;
//# sourceMappingURL=PlayerClassStatsModule.js.map