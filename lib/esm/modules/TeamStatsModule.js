import * as events from '../events';
class TeamStatsModule {
    constructor(gameState) {
        this.defaultTeam = () => ({
            score: 0,
            kills: 0,
            deaths: 0,
            damage: 0,
            charges: 0,
            drops: 0,
            captures: 0,
            midfights: 0,
        });
        this.defaultPlayer = () => ({
            team: null,
            kills: 0,
            deaths: 0,
            damage: 0,
            charges: 0,
            drops: 0,
        });
        this.identifier = 'teams';
        this.players = new Map();
        this.teams = {
            Red: this.defaultTeam(),
            Blue: this.defaultTeam(),
        };
        this.gameState = gameState;
        this.isFirstCap = true;
    }
    getOrCreatePlayer(player) {
        if (!this.players.has(player.id)) {
            this.players.set(player.id, this.defaultPlayer());
        }
        let playerInstance = this.players.get(player.id);
        if (!playerInstance)
            throw new Error();
        playerInstance.team = player.team;
        return playerInstance;
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        attacker.kills += 1;
        const victim = this.getOrCreatePlayer(event.victim);
        victim.deaths += 1;
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        attacker.damage += event.damage;
    }
    onCharge(event) {
        if (!this.gameState.isLive)
            return;
        const player = this.getOrCreatePlayer(event.player);
        player.charges += 1;
    }
    onRoundStart(event) {
        this.isFirstCap = true;
    }
    onRoundEnd(event) {
        if (event.winner == events.Team.Blue) {
            this.teams.Blue.score += 1;
        }
        if (event.winner == events.Team.Red) {
            this.teams.Red.score += 1;
        }
    }
    onCapture(event) {
        if (!this.gameState.isLive)
            return;
        this.teams[event.team].captures += 1;
        if (this.isFirstCap)
            this.teams[event.team].midfights += 1;
        this.isFirstCap = false;
    }
    onMedicDeath(event) {
        if (!this.gameState.isLive)
            return;
        if (event.isDrop) {
            const victim = this.getOrCreatePlayer(event.victim);
            victim.drops += 1;
        }
    }
    finish() {
        this.players.forEach((stats, playerId) => {
            if (stats.team !== 'Red' && stats.team !== 'Blue')
                return;
            const teamStats = this.teams[stats.team];
            if (!teamStats)
                return;
            teamStats.kills += stats.kills;
            teamStats.deaths += stats.deaths;
            teamStats.damage += stats.damage;
            teamStats.charges += stats.charges;
            teamStats.drops += stats.drops;
        });
    }
    toJSON() {
        return this.teams;
    }
}
export default TeamStatsModule;
//# sourceMappingURL=TeamStatsModule.js.map