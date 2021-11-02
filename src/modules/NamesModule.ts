import { ICaptureEvent, IDamageEvent, IRoleEvent, ISpawnEvent } from "../interfaces/events"
import { events, IGameState } from "../LogParser"
import { Names } from "../interfaces/LogstfInterfaces"


class NamesModule implements events.IStats {
    public identifier: string
    private players: { [id: string]: string }
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'playernames'
        this.players = {}
        this.gameState = gameState
    }

    onDamage(event: IDamageEvent) {
        if (!this.gameState.isLive) return
        if (this.players[event.attacker.id]) return
        this.players[event.attacker.id] = event.attacker.name
    }

    onSpawn(event: ISpawnEvent) {
        if (!this.gameState.isLive) return
        if (this.players[event.player.id]) return
        this.players[event.player.id] = event.player.name
    }

    onRole(event: IRoleEvent) {
        if (!this.gameState.isLive) return
        if (this.players[event.player.id]) return
        this.players[event.player.id] = event.player.name
    }

    toJSON(): { [id: string]: string } {
        return this.players
    }

    toLogstf(): Names {
        return <Names>this.toJSON()
    }

}

export default NamesModule