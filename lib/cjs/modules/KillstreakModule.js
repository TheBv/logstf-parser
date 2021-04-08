"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KillstreakModule {
    constructor(gameState) {
        this.identifier = 'killstreaks';
        this.kills = new Map();
        this.gameState = gameState;
        this.killstreaks = [];
        this.gameStartTime = null;
    }
    onRoundStart(event) {
        if (!this.gameStartTime)
            this.gameStartTime = event.timestamp;
    }
    onKill(event) {
        var _a;
        if (!this.gameState.isLive)
            return;
        let gameTime = 0;
        if (this.gameStartTime) {
            gameTime = event.timestamp - this.gameStartTime;
            if (gameTime < 0)
                gameTime = 0;
        }
        if (this.kills.has(event.attacker.id)) {
            (_a = this.kills.get(event.attacker.id)) === null || _a === void 0 ? void 0 : _a.push(gameTime);
        }
        else {
            this.kills.set(event.attacker.id, [gameTime]);
        }
    }
    finish() {
        const self = this;
        this.kills.forEach(function (value, attacker, map) {
            let streak = 1;
            for (let killIndex = 0; killIndex < value.length - 1; killIndex++) {
                const killTime = value[killIndex];
                if (killTime + 11 >= value[killIndex + 1]) {
                    streak++;
                }
                else {
                    if (streak >= 3) {
                        const killstreak = {
                            steamid: attacker,
                            streak: streak,
                            time: value[killIndex - streak + 1]
                        };
                        self.killstreaks.push(killstreak);
                    }
                    streak = 1;
                }
            }
        });
        this.killstreaks.sort((a, b) => a.time - b.time);
    }
    toJSON() {
        return this.killstreaks;
    }
}
exports.default = KillstreakModule;
//# sourceMappingURL=KillstreakModule.js.map