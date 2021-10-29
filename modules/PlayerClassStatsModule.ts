import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'



interface IClassStats {
    playtimeInSeconds: number
    kills: number
    assists: number
    deaths: number
    damage: number
    damageTaken: number
    healsReceived: number
    healsDistributed: number
    weapons: Map<string, IWeaponStats>
}

interface IWeaponStats {
    kills: number
    damage: number
    avgDamage: number
    avgDamages: number[]
    shots: number
    hits: number
}

class PlayerClassStatsModule implements events.IStats {
    public identifier: string
    private players: Map<string, Map<string, IClassStats>>
    private gameState: IGameState
    private currentRoles: Map<string, string>
    private currentSpawntimes: Map<string, number>

    constructor(gameState: IGameState) {
        this.identifier = 'playerClasses'
        this.players = new Map<string, Map<string, IClassStats>>()
        this.gameState = gameState
        this.currentRoles = new Map<string, string>()
        this.currentSpawntimes = new Map<string, number>()
    }

    private defaultClassStats = (): IClassStats => ({
        playtimeInSeconds: 0,
        kills: 0,
        assists: 0,
        deaths: 0,
        damage: 0,
        damageTaken: 0,
        healsDistributed: 0,
        healsReceived: 0,
        weapons: new Map<string, IWeaponStats>(),
    })

    private defaultWeaponStats = (): IWeaponStats => ({
        kills: 0,
        damage: 0,
        avgDamage: 0,
        avgDamages: [],
        shots: 0,
        hits: 0,
    })

    private getClassStats(player: string, role: string): IClassStats {
        if (!this.players.has(player)) {
            this.players.set(player, new Map<string, IClassStats>())
        }
        const playerInstance = this.players.get(player)!

        if (!playerInstance.has(role)) {
            playerInstance.set(role, this.defaultClassStats())
        }

        const returnInstance = playerInstance.get(role)!
        return returnInstance
    }

    private getWeaponStats(weaponMap: Map<string, IWeaponStats>, weapon: string): IWeaponStats {
        if (!weaponMap.has(weapon)) {
            weaponMap.set(weapon, this.defaultWeaponStats())
        }
        return weaponMap.get(weapon)!
    }

    private getMean(input: number[]): number{
        if (input.length != 0)
            return input.reduce((a,b) => a+b) /input.length
        return 0
    }

    private trackingStop(playerId: string, timestamp: number) {
        const currentRole = this.currentRoles.get(playerId)
        const currentSpawntime = this.currentSpawntimes.get(playerId)

        if (currentRole && currentSpawntime) {
            const oldRole = this.getClassStats(playerId, currentRole)
            oldRole.playtimeInSeconds += timestamp - currentSpawntime
            this.currentSpawntimes.delete(playerId)
        }
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        const attackerRole = this.currentRoles.get(event.attacker.id)
        if (attackerRole) {
            const attackerStats = this.getClassStats(event.attacker.id, attackerRole)
            attackerStats.kills += 1
            const weaponStats = this.getWeaponStats(attackerStats.weapons, event.weapon!)
            weaponStats.kills += 1
        }

        const victimRole = this.currentRoles.get(event.victim.id)
        if (victimRole) {
            const victimStats = this.getClassStats(event.victim.id, victimRole)
            victimStats.deaths += 1
        }
    }

    onAssist(event: events.IAssistEvent){
        if (!this.gameState.isLive) return
        const assisterRole = this.currentRoles.get(event.assister.id)
        if (!assisterRole) return
        const assisterStats = this.getClassStats(event.assister.id,assisterRole)
        assisterStats.assists += 1
    }
    
    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return

        const attackerRole = this.currentRoles.get(event.attacker.id)
        
        if (!attackerRole) return
        const attackerStats = this.getClassStats(event.attacker.id, attackerRole)
        attackerStats.damage += event.damage

        const weaponStats = this.getWeaponStats(attackerStats.weapons, event.weapon!)
        weaponStats.damage += event.damage
        weaponStats.avgDamages.push(event.damage);

        if (event.victim != null){
            const victimRole = this.currentRoles.get(event.victim.id)
            if (!victimRole) return
            const victimStats = this.getClassStats(event.victim.id,victimRole)
            victimStats.damageTaken += event.damage
        }
    }

    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        const targetRole = this.currentRoles.get(event.target.id)
        const healerRole = this.currentRoles.get(event.healer.id)
        if (targetRole) {
            const targetStats = this.getClassStats(event.target.id, targetRole)
            targetStats.healsReceived += event.healing
        }
        if (!healerRole) return
        const healerStats = this.getClassStats(event.healer.id,healerRole)
        healerStats.healsDistributed += event.healing
    }
    
    onShot(event: events.IShotEvent) {
        if (!this.gameState.isLive) return
        const playerRole = this.currentRoles.get(event.player.id)
        if (playerRole) {
        const playerStats = this.getClassStats(event.player.id, playerRole)
        const weaponStats = this.getWeaponStats(playerStats.weapons, event.weapon)
        weaponStats.shots += 1
        }
    }

    onShotHit(event: events.IShotEvent) {
        if (!this.gameState.isLive) return
        const playerRole = this.currentRoles.get(event.player.id)
        if (playerRole) {
            const playerStats = this.getClassStats(event.player.id, playerRole)
            const weaponStats = this.getWeaponStats(playerStats.weapons, event.weapon)
            weaponStats.hits += 1
        }
    }

    onSpawn(event: events.ISpawnEvent) {
        if (!this.gameState.isLive) return
        this.trackingStop(event.player.id, event.timestamp)

        this.currentRoles.set(event.player.id, event.role)
        this.currentSpawntimes.set(event.player.id, event.timestamp)
    }

    onRole(event: events.IRoleEvent) {
        if (!this.gameState.isLive) return
        this.trackingStop(event.player.id, event.timestamp)

        this.currentRoles.set(event.player.id, event.role)
        this.currentSpawntimes.set(event.player.id, event.timestamp)
    }

    onRoundEnd(event: events.IRoundEndEvent) {
        for (let playerId of this.currentRoles.keys()) {
            this.trackingStop(playerId, event.timestamp)
        }
    }

    onDisconnect(event: events.IDisconnectEvent) {
        this.trackingStop(event.player.id, event.timestamp)
    }

    onJoinTeam(event: events.IJoinTeamEvent) {
        if (event.newTeam === 'Spectator') {
            this.trackingStop(event.player.id, event.timestamp)
        }
    }

    finish() {
        const self = this;
        //calculate average damage done on finish
        this.players.forEach(function(playerStats,key){
            playerStats.forEach(function(classStarts,key){
                classStarts.weapons.forEach(function(weaponStats,key){
                    weaponStats.avgDamage = self.getMean(weaponStats.avgDamages);
                })
            })
        })
    }

    toJSON(): Map<string, Map<string, IClassStats>> {
        return this.players
    }

}

export default PlayerClassStatsModule