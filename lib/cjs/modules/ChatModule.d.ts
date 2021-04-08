import * as events from '../events';
import { IGameState } from '../Game';
interface IMessage {
    timeInSeconds: number;
    steamid: string;
    name: string;
    team: string | null;
    message: string;
}
declare class ChatModule implements events.IStats {
    identifier: string;
    private messages;
    private gameStartTime;
    constructor(gameState: IGameState);
    onRoundStart(event: events.IRoundStartEvent): void;
    onChat(event: events.IChatEvent): void;
    toJSON(): IMessage[];
}
export default ChatModule;
