import * as events from '../events'
import { IGameState, PlayerInfo } from '../LogParser'

interface IMessage {
    timeInSeconds: number
    steamid: string
    name: string
    team: string | null
    message: string
}


class ChatModule implements events.IStats {
    public identifier: string
    private messages: IMessage[]
    private gameStartTime: number | null

    constructor(gameState: IGameState) {
        this.identifier = 'chat'
        this.messages = []
        this.gameStartTime = null
    }

    onRoundStart(event: events.IRoundStartEvent) {
        if (!this.gameStartTime) this.gameStartTime = event.timestamp
    }

    onChat(event: events.IChatEvent) {
        let gameTime = 0
        if (this.gameStartTime) {
            gameTime = event.timestamp - this.gameStartTime
            if (gameTime < 0) gameTime = 0
        }
        this.messages.push({
            timeInSeconds: gameTime,
            steamid: event.player.id,
            name: event.player.name,
            team: event.player.team,
            message: event.message,
        })
    }

    toJSON(): IMessage[] {
        return this.messages
    }

}

export default ChatModule