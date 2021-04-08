class GameStateModule {
    constructor(gameState) {
        this.identifier = 'game';
        this.gameState = gameState;
        this.currentRoundStartTime = 0;
        this.currentRoundPausedStart = 0;
        this.currentRoundPausedTime = 0;
        this.currentRoundEvents = [];
        this.totalLengthInSeconds = 0;
        this.rounds = [];
        this.playerNames = {};
    }
    newRound(timestamp) {
        this.currentRoundEvents = [];
        this.currentRoundStartTime = timestamp;
        this.currentRoundPausedTime = 0;
        this.currentRoundPausedStart = 0;
        this.gameState.isLive = true;
    }
    endRound(timestamp, winner) {
        if (this.gameState.isLive === false)
            return;
        this.gameState.isLive = false;
        const roundLength = timestamp - this.currentRoundStartTime - this.currentRoundPausedTime;
        if (roundLength < 1)
            return;
        this.rounds.push({
            lengthInSeconds: roundLength,
            redScore: 0,
            bluScore: 0,
            winner: winner,
            events: this.currentRoundEvents,
        });
        this.totalLengthInSeconds += roundLength;
    }
    getLastRound() {
        return this.rounds[this.rounds.length - 1];
    }
    onKill(event) {
        this.playerNames[event.attacker.id] = event.attacker.name;
        this.playerNames[event.victim.id] = event.victim.name;
    }
    onScore(event) {
        const lastRound = this.getLastRound();
        if (!lastRound)
            return;
        if (event.team == 'Red') {
            lastRound.redScore = event.score;
        }
        else if (event.team == 'Blue') {
            lastRound.bluScore = event.score;
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
    onCapture(event) {
        const time = event.timestamp - this.currentRoundStartTime;
        this.currentRoundEvents.push({
            type: 'capture',
            timeInSeconds: time,
            team: event.team,
            pointId: event.pointId,
            playerIds: event.playerIds
        });
    }
    toJSON() {
        return {
            names: this.playerNames,
            totalLengthInSeconds: this.totalLengthInSeconds,
            rounds: this.rounds
        };
    }
}
export default GameStateModule;
//# sourceMappingURL=GameStateModule.js.map