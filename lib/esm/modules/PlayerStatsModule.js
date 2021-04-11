import * as events from '../events';
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
            drops: 0,
            airshots: 0,
            sentriesBuilt: 0,
            sentriesDestroyed: 0,
            headshots: 0,
            headshotKills: 0,
            healing: 0,
            healingReceived: 0,
            medkits: 0,
            medkitsHp: 0,
            backstabs: 0,
            capturesPoint: 0,
            capturesIntel: 0,
            longestKillStreak: 0,
            currentKillStreak: 0,
            medicstats: null,
        });
        this.defaultInternalStats = () => ({
            timesBeforeHealing: [],
            timesToBuild: [],
            uberLengths: [],
            timesBeforeUsing: [],
            shots: 0,
            shotsHit: 0,
            lastUsedTime: 0,
            lastSpawnTime: 0,
            lastChargeObtainedTime: 0,
            lastTimeDamageTaken: 0
        });
        this.defaultMedicStats = () => ({
            advantagesLost: 0,
            biggestAdvantageLost: 0,
            nearFullChargeDeaths: 0,
            deathsAfterUber: 0,
            avgTimeBeforeHealing: 0,
            avgTimeToBuild: 0,
            avgTimeToUse: 0,
            avgUberLength: 0
        });
        this.identifier = 'players';
        this.players = {};
        this.internalStats = {};
        this.gameState = gameState;
    }
    getMean(input) {
        if (input.length != 0)
            return input.reduce((a, b) => a + b) / input.length;
        return 0;
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
    getOrCreateStats(player) {
        if (!(player.id in this.internalStats)) {
            this.internalStats[player.id] = this.defaultInternalStats();
        }
        let playerInstance = this.internalStats[player.id];
        if (!playerInstance)
            throw new Error();
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
            attacker.airshots += 1;
        if (event.victim) {
            const victim = this.getOrCreatePlayer(event.victim);
            const stats = this.getOrCreateStats(event.victim);
            if (victim) {
                victim.damageTaken += event.damage;
            }
            stats.lastTimeDamageTaken = event.timestamp;
        }
    }
    onCapture(event) {
        if (!this.gameState.isLive)
            return;
        for (const playerInfo of event.players) {
            const player = this.getOrCreatePlayer(playerInfo);
            player.capturesPoint += 1;
        }
    }
    onFlag(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        if (event.type == events.FlagEvent.Captured) {
            player.capturesIntel += 1;
        }
    }
    onPickup(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        if (event.healing) {
            player.medkitsHp += event.healing;
            switch (event.item) {
                case ("medkit_medium"):
                    player.medkits += 2;
                    break;
                case ("medkit_large"):
                    player.medkits += 4;
                    break;
                default:
                    player.medkits += 1;
                    break;
            }
        }
    }
    onHeal(event) {
        if (!this.gameState.isLive)
            return;
        const healer = this.getOrCreatePlayer(event.healer);
        const statsHealer = this.getOrCreateStats(event.healer);
        const target = this.getOrCreatePlayer(event.target);
        const statsTarget = this.getOrCreateStats(event.target);
        healer.healing += event.healing;
        target.healingReceived += event.healing;
        if (statsTarget.lastTimeDamageTaken) {
            statsHealer.timesBeforeHealing.push(event.timestamp - Math.max(statsTarget.lastSpawnTime, statsTarget.lastTimeDamageTaken));
        }
    }
    onBuild(event) {
        if (!this.gameState.isLive)
            return;
        if (event.builtObject == events.Building.Sentry) {
            const player = this.getOrCreatePlayer(event.player);
            player.sentriesBuilt += 1;
        }
    }
    onObjectDestroyed(event) {
        if (!this.gameState.isLive)
            return;
        if (event.builtObject == events.Building.Sentry) {
            const player = this.getOrCreatePlayer(event.attacker);
            player.sentriesDestroyed += 1;
        }
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
    onSpawn(event) {
        if (!this.gameState.isLive)
            return;
        const stats = this.getOrCreateStats(event.player);
        stats.lastSpawnTime = event.timestamp;
    }
    //Medic specific events
    onCharge(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        const stats = this.getOrCreateStats(event.player);
        player.charges += 1;
        if (!(event.medigunType in player.chargesByType)) {
            player.chargesByType[event.medigunType] = 0;
        }
        player.chargesByType[event.medigunType] += 1;
        stats.timesBeforeUsing.push(event.timestamp - stats.lastChargeObtainedTime);
    }
    onChargeReady(event) {
        if (!this.gameState.isLive)
            return;
        const stats = this.getOrCreateStats(event.player);
        stats.lastChargeObtainedTime = event.timestamp;
        stats.timesToBuild.push(event.timestamp - Math.max(stats.lastUsedTime, stats.lastSpawnTime));
    }
    onLostUberAdv(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats();
        }
        player.medicstats.advantagesLost += 1;
        player.medicstats.biggestAdvantageLost = Math.max(player.medicstats.biggestAdvantageLost, event.time);
    }
    onMedicDeath(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        const victim = this.getOrCreatePlayer(event.victim);
        const stats = this.getOrCreateStats(event.victim);
        if (event.isDrop)
            victim.drops += 1;
        if (event.timestamp - stats.lastUsedTime <= 20) {
            if (!victim.medicstats) {
                victim.medicstats = this.defaultMedicStats();
            }
            victim.medicstats.deathsAfterUber += 1;
        }
    }
    onMedicDeathEx(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats();
        }
        if (event.uberpct >= 95 && event.uberpct < 100) {
            player.medicstats.nearFullChargeDeaths += 1;
        }
    }
    onChargeEnded(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        const stats = this.getOrCreateStats(event.player);
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats();
        }
        stats.lastUsedTime = event.timestamp;
        stats.uberLengths.push(event.duration);
    }
    finish() {
        const self = this;
        for (const key of Object.keys(this.internalStats)) {
            const player = self.players[key];
            const stats = self.internalStats[key];
            if (player.medicstats && stats) {
                player.medicstats.avgUberLength = self.getMean(stats.uberLengths);
                player.medicstats.avgTimeToBuild = self.getMean(stats.timesToBuild);
                player.medicstats.avgTimeToUse = self.getMean(stats.timesBeforeUsing);
                player.medicstats.avgTimeBeforeHealing = self.getMean(stats.timesBeforeHealing);
            }
        }
    }
    toJSON() {
        return this.players;
    }
}
export default PlayerStatsModule;
//# sourceMappingURL=PlayerStatsModule.js.map