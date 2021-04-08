"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatModule {
    constructor(gameState) {
        this.identifier = 'chat';
        this.messages = [];
        this.gameStartTime = null;
    }
    onRoundStart(event) {
        if (!this.gameStartTime)
            this.gameStartTime = event.timestamp;
    }
    onChat(event) {
        let gameTime = 0;
        if (this.gameStartTime) {
            gameTime = event.timestamp - this.gameStartTime;
            if (gameTime < 0)
                gameTime = 0;
        }
        this.messages.push({
            timeInSeconds: gameTime,
            steamid: event.player.id,
            name: event.player.name,
            team: event.player.team,
            message: event.message,
        });
    }
    toJSON() {
        return this.messages;
    }
}
exports.default = ChatModule;
//# sourceMappingURL=ChatModule.js.map