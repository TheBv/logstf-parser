import * as events from '../events';
import { IGameState } from '../Game';
declare class HealSpreadModule implements events.IStats {
    identifier: string;
    private healspread;
    private gameState;
    constructor(gameState: IGameState);
    private getOrCreateHealer;
    onHeal(event: events.IHealEvent): void;
    toJSON(): {
        [id: string]: {
            [id: string]: number;
        };
    };
}
export default HealSpreadModule;
