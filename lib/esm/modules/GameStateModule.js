"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("../events");
class GameStateModule {
    constructor(gameState) {
        this.defaultTeamStats = (score) => ({
            score: score,
            kills: 0,
            dmg: 0,
            ubers: 0
        });
        this.defaultPlayer = () => ({
            team: null,
            kills: 0,
            dmg: 0,
        });
        this.identifier = 'game';
        this.gameState = gameState;
        this.currentRoundStartTime = 0;
        this.currentRoundPausedStart = 0;
        this.currentRoundPausedTime = 0;
        this.currentRoundEvents = [];
        this.currentRoundTeams = { Blue: this.defaultTeamStats(0), Red: this.defaultTeamStats(0) };
        this.currentRoundPlayers = {};
        this.firstCap = "";
        this.totalLengthInSeconds = 0;
        this.rounds = [];
    }
    getOrCreatePlayer(player) {
        if (!(player.id in this.currentRoundPlayers)) {
            this.currentRoundPlayers[player.id] = this.defaultPlayer();
        }
        let playerInstance = this.currentRoundPlayers[player.id];
        if (!playerInstance)
            throw new Error();
        playerInstance.team = player.team;
        return playerInstance;
    }
    newRound(timestamp) {
        this.currentRoundEvents = [];
        this.currentRoundStartTime = timestamp;
        this.currentRoundPausedTime = 0;
        this.currentRoundPausedStart = 0;
        this.gameState.isLive = true;
        this.currentRoundTeams = { Blue: this.defaultTeamStats(this.currentRoundTeams.Blue.score), Red: this.defaultTeamStats(this.currentRoundTeams.Red.score) };
        this.firstCap = "";
        this.currentRoundPlayers = {};
    }
    endRound(timestamp, winner) {
        if (this.gameState.isLive === false)
            return;
        this.gameState.isLive = false;
        const roundLength = timestamp - this.currentRoundStartTime - this.currentRoundPausedTime;
        if (roundLength < 1)
            return;
        if (winner) {
            this.currentRoundEvents.push({
                type: "round_win",
                time: roundLength,
                team: winner
            });
        }
        this.rounds.push({
            lengthInSeconds: roundLength,
            firstCap: this.firstCap,
            winner: winner,
            events: this.currentRoundEvents,
            players: this.currentRoundPlayers,
            team: this.currentRoundTeams
        });
        this.totalLengthInSeconds += roundLength;
    }
    getLastRound() {
        return this.rounds[this.rounds.length - 1];
    }
    onKill(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        attacker.kills += 1;
        if (attacker.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.kills += 1;
        }
        if (attacker.team == events.Team.Red) {
            this.currentRoundTeams.Red.kills += 1;
        }
    }
    onDamage(event) {
        if (!this.gameState.isLive)
            return;
        const attacker = this.getOrCreatePlayer(event.attacker);
        attacker.dmg += event.damage;
        if (attacker.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.dmg += event.damage;
        }
        if (attacker.team == events.Team.Red) {
            this.currentRoundTeams.Red.dmg += event.damage;
        }
    }
    onScore(event) {
        const lastRound = this.getLastRound();
        if (!lastRound)
            return;
        if (event.team == events.Team.Red) {
            this.currentRoundTeams.Red.score = event.score;
        }
        else if (event.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.score = event.score;
        }
    }
    onRoundStart(event) {
        this.newRound(event.timestamp);
    }
    onRoundEnd(event) {
        this.endRound(event.timestamp, event.winner);
    }
    onGameOver(event) {
        this.endRound(event.timestamp, null);
    }
    onPause(event) {
        this.gameState.isLive = false;
        this.currentRoundPausedStart = event.timestamp;
    }
    onUnpause(event) {
        this.gameState.isLive = true;
        if (this.currentRoundPausedStart > 0 && event.timestamp > this.currentRoundPausedStart) {
            this.currentRoundPausedTime += event.timestamp - this.currentRoundPausedStart;
            this.currentRoundPausedStart = 0;
        }
    }
    onMapLoad(event) {
        this.gameState.mapName = event.mapName;
    }
    onFlag(event) {
        if (!this.gameState.isLive)
            return;
        const time = event.timestamp - this.currentRoundStartTime;
        this.currentRoundEvents.push({
            type: event.type,
            time: time,
            steamid: event.player.id,
            team: event.player.team
        });
    }
    onCapture(event) {
        if (!this.gameState.isLive)
            return;
        const time = event.timestamp - this.currentRoundStartTime;
        if (this.currentRoundEvents.filter(evt => evt.type == 'capture').length == 0) {
            this.firstCap = event.team;
        }
        this.currentRoundEvents.push({
            type: 'pointcap',
            timeInSeconds: time,
            team: event.team,
            pointId: event.pointId,
            playerIds: event.players.map(player => player.id)
        });
    }
    onCharge(event) {
        if (!this.gameState.isLive)
            return;
        const time = event.timestamp - this.currentRoundStartTime;
        const attacker = this.getOrCreatePlayer(event.player);
        if (attacker.team == events.Team.Blue) {
            this.currentRoundTeams.Blue.ubers += 1;
        }
        if (attacker.team == events.Team.Red) {
            this.currentRoundTeams.Red.ubers += 1;
        }
        this.currentRoundEvents.push({
            type: 'charge',
            timeInSeconds: time,
            medigun: event.medigunType,
            team: event.player.team,
            steamid: event.player.id,
        });
    }
    onMedicDeath(event) {
        if (!this.gameState.isLive)
            return;
        const time = event.timestamp - this.currentRoundStartTime;
        if (event.isDrop) {
            this.currentRoundEvents.push({
                type: 'drop',
                timeInSeconds: time,
                team: event.victim.team,
                steamid: event.victim.id,
            });
        }
        this.currentRoundEvents.push({
            type: 'medic_death',
            timeInSeconds: time,
            team: event.victim.team,
            steamid: event.victim.id,
            attacker: event.attacker.id
        });
    }
    toJSON() {
        return {
            rounds: this.rounds,
            toatlLength: this.totalLengthInSeconds
        };
    }
}
exports.default = GameStateModule;
//# sourceMappingURL=GameStateModule.js.map