"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const events = __importStar(require("../events"));
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
exports.default = TeamStatsModule;
//# sourceMappingURL=TeamStatsModule.js.map