import * as events from '../events';
import { IGameState } from '../Game';
export default class RealDamageModule implements events.IStats {
    identifier: string;
    private gameState;
    private notableEvents;
    private damageEvents;
    private realDamages;
    constructor(gameState: IGameState);
    onKill(event: events.IKillEvent): void;
    onCapture(event: events.ICaptureEvent): void;
    onCharge(event: events.IChargeEvent): void;
    onDamage(event: events.IDamageEvent): void;
    finish(): void;
    toJSON(): {
        [id: string]: number;
    };
}
