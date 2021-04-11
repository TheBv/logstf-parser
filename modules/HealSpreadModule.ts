//TODO: Healspread things
import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'

class HealSpreadModule implements events.IStats {
    public identifier: string
    private healspread: {[id:string]: {[id:string]:number}}
    private gameState: IGameState
    constructor(gameState: IGameState) {
        this.identifier = 'healspread'
        this.gameState = gameState
        this.healspread = {}
    }

    private getOrCreateHealer(player: PlayerInfo): {[id:string]:number} {
        if (!(player.id in this.healspread)) {
            this.healspread[player.id] = {}
        }
        let playerInstance = this.healspread[player.id]
        if (!playerInstance) throw new Error()
        return playerInstance
    }

    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        const healingTargets = this.getOrCreateHealer(event.healer)
        const healer = this.getOrCreateHealer(event.healer)
        if (!(event.target.id in healer)) {
            healer[event.target.id] = 0
        }
        healer[event.target.id] += event.healing
    }

    toJSON(){
        return this.healspread
    }
}
export default HealSpreadModule