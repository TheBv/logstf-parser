import * as events from '../interfaces/events'
import { IGameState } from '../Game'


interface IKillstreak {
    steamid: string
    streak: number
    time: number
}

class KillstreakModule implements events.IStats {
    public identifier: string
    private kills: Map<string, number[]>
    private gameState: IGameState
    private killstreaks: IKillstreak[]
    private gameStartTime: number | null

    constructor(gameState: IGameState) {
        this.identifier = 'killstreaks'
        this.kills = new Map<string, number[]>()
        this.gameState = gameState
        this.killstreaks = []
        this.gameStartTime = null
    }

    onRoundStart(event: events.IRoundStartEvent) {
        if (!this.gameStartTime) this.gameStartTime = event.timestamp
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        let gameTime = 0
        if (this.gameStartTime) {
            gameTime = event.timestamp - this.gameStartTime
            if (gameTime < 0) gameTime = 0
        }
        if (this.kills.has(event.attacker.id)) {
            this.kills.get(event.attacker.id)?.push(gameTime)
        }
        else {
            this.kills.set(event.attacker.id, [gameTime])
        }

    }

    finish() {
        const self = this
        this.kills.forEach(function (value, attacker, map) {
            let streak = 1
            for (let killIndex = 0; killIndex < value.length - 1; killIndex++) {
                const killTime = value[killIndex]
                if (killTime + 11 >= value[killIndex + 1]) {
                    streak++
                }
                else {
                    if (streak >= 3) {
                        const killstreak = {
                            steamid: attacker,
                            streak: streak,
                            time: value[killIndex - streak + 1]
                        }
                        self.killstreaks.push(killstreak)
                    }
                    streak = 1
                }
            }

        })
        this.killstreaks.sort((a, b) => a.time - b.time)
    }

    toJSON(): IKillstreak[] {
        return this.killstreaks
    }

    toLogstf(): IKillstreak[] {
        return this.toJSON()
    }

}

export default KillstreakModule